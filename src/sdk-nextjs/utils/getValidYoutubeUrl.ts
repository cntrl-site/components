enum Allowed {
  Tiny = 'youtu.be',
  Full = 'www.youtube.com'
}

export function getYoutubeId({ hostname, pathname, search }: URL): string {
  if (hostname !== Allowed.Full && hostname !== Allowed.Tiny) {
    throw new Error(`Cannot get valid YouTube ID from "${hostname}" - address is not whitelisted`);
  }
  switch (hostname) {
    case Allowed.Tiny:
      return pathname.replace('/', '');
    case Allowed.Full:
      if (pathname.startsWith('/shorts/')) {
        const shortsId = pathname.split('/shorts/')[1];
        if (!shortsId) {
          throw new Error('Cannot get valid YouTube Shorts ID from the pathname.');
        }
        return shortsId;
      } else {
        const searchParams = new URLSearchParams(search);
        const id = searchParams.get('v');
        if (!id) {
          throw new Error('Cannot get valid YouTube ID from search params.');
        }
        return id;
      }
  }
}
