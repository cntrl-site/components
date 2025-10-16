// @ts-ignore
import * as MP4Box from 'mp4box';

export class Writer {
  private data: Uint8Array;
  private idx: number;
  private size: number;

  constructor(size: number) {
    this.data = new Uint8Array(size);
    this.idx = 0;
    this.size = size;
  }

  getData() {
    if (this.idx !== this.size) throw new Error('Mismatch between size reserved and sized used');
    return this.data.slice(0, this.idx);
  }

  writeUint8(value: number) {
    this.data.set([value], this.idx);
    this.idx += 1;
  }

  writeUint16(value: number) {
    const arr = new Uint16Array(1);
    arr[0] = value;
    const buffer = new Uint8Array(arr.buffer);
    this.data.set([buffer[1], buffer[0]], this.idx);
    this.idx += 2;
  }

  writeUint8Array(value: Uint8Array) {
    this.data.set(value, this.idx);
    this.idx += value.length;
  }
}

interface AVCCBox {
  configurationVersion: number;
  AVCProfileIndication: number;
  profile_compatibility: number;
  AVCLevelIndication: number;
  lengthSizeMinusOne: number;
  nb_SPS_nalus: number;
  SPS: { length: number; nalu: Uint8Array }[];
  nb_PPS_nalus: number;
  PPS: { length: number; nalu: Uint8Array }[];
}

const getExtradata = (avccBox: AVCCBox) => {
  let i;
  let size = 7;
  for (i = 0; i < avccBox.SPS.length; i += 1) {
    // nalu length is encoded as a uint16.
    size += 2 + avccBox.SPS[i].length;
  }
  for (i = 0; i < avccBox.PPS.length; i += 1) {
    // nalu length is encoded as a uint16.
    size += 2 + avccBox.PPS[i].length;
  }
  const writer = new Writer(size);
  writer.writeUint8(avccBox.configurationVersion);
  writer.writeUint8(avccBox.AVCProfileIndication);
  writer.writeUint8(avccBox.profile_compatibility);
  writer.writeUint8(avccBox.AVCLevelIndication);
  writer.writeUint8(avccBox.lengthSizeMinusOne + (63 << 2));
  writer.writeUint8(avccBox.nb_SPS_nalus + (7 << 5));
  for (i = 0; i < avccBox.SPS.length; i += 1) {
    writer.writeUint16(avccBox.SPS[i].length);
    writer.writeUint8Array(avccBox.SPS[i].nalu);
  }
  writer.writeUint8(avccBox.nb_PPS_nalus);
  for (i = 0; i < avccBox.PPS.length; i += 1) {
    writer.writeUint16(avccBox.PPS[i].length);
    writer.writeUint8Array(avccBox.PPS[i].nalu);
  }
  return writer.getData();
};

const decodeVideo = (
  src: string,
  emitFrame: (bitmap: ImageBitmap) => void,
  { VideoDecoder, EncodedVideoChunk, debug }: any
): Promise<void> =>
  new Promise((resolve, reject) => {
    if (debug) console.info('Decoding video from', src);
    try {
      const mp4boxfile = MP4Box.createFile();
      let codec;
      const decoder = new VideoDecoder({
        output: (frame: VideoFrame) => {
          createImageBitmap(frame, { resizeQuality: 'low' }).then((bitmap) => {
            emitFrame(bitmap);
            frame.close();
            if (decoder.decodeQueueSize <= 0) {
              setTimeout(() => {
                if (decoder.state !== 'closed') {
                  decoder.close();
                  resolve();
                }
              }, 500);
            }
          });
        },
        error: (e: any) => {
          console.error(e);
          reject(e);
        },
      });

      mp4boxfile.onReady = (info: any) => {
        if (info && info.videoTracks && info.videoTracks[0]) {
          [{ codec }] = info.videoTracks;
          if (debug) console.info('Video with codec:', codec);
          const avccBox = mp4boxfile.moov.traks[0].mdia.minf.stbl.stsd.entries[0].avcC;
          const extradata = getExtradata(avccBox);
          decoder.configure({ codec, description: extradata });
          mp4boxfile.setExtractionOptions(info.videoTracks[0].id);
          mp4boxfile.start();
        } else reject(new Error('URL provided is not a valid mp4 video file.'));
      };

      mp4boxfile.onSamples = (track_id: number, ref: any, samples: any[]) => {
        for (let i = 0; i < samples.length; i += 1) {
          const sample = samples[i];
          const type = sample.is_sync ? 'key' : 'delta';
          const chunk = new EncodedVideoChunk({
            type,
            timestamp: sample.cts,
            duration: sample.duration,
            data: sample.data,
          });
          decoder.decode(chunk);
        }
      };

      fetch(src).then((res) => {
        const reader = res.body!.getReader();
        let offset = 0;
        //@ts-ignore
        function appendBuffers({ done, value }: any) {
          if (done) {
            mp4boxfile.flush();
            return null;
          }
          const buf = value.buffer;
          buf.fileStart = offset;
          offset += buf.byteLength;
          mp4boxfile.appendBuffer(buf);
          return reader.read().then(appendBuffers);
        }
        return reader.read().then(appendBuffers);
      });
    } catch (e) {
      reject(e);
    }
  });


export default ( src: string, emitFrame: (bitmap: ImageBitmap) => void, debug: boolean): Promise<void> => {
  if (typeof VideoDecoder === 'function' && typeof EncodedVideoChunk === 'function') {
    if (debug)
      console.info('WebCodecs is natively supported, using native version...');
    return decodeVideo(src, emitFrame, {
      VideoDecoder,
      EncodedVideoChunk,
      debug,
    });
  }
  if (debug) console.info('WebCodecs is not available in this browser.');
  return Promise.resolve();
};
