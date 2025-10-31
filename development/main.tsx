import React from 'react';
import ReactDOM from 'react-dom/client';
import { LightboxGallery } from '../src/Components/Lightbox/Lightbox';

const settings = {
  "cover": {
    "url": "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERMHNP08T27H1649S67NZV.png"
  },
  "appear": {
    "type": "slide",
    "duration": "2000ms",
    "direction": "right",
    "repeat": "close"
  },
  "triggers": {
    "type": "click",
    "switch": "image",
    "duration": "2000ms"
  },
  "slider": {
    "type": "fade",
    "direction": "horiz"
  },
  "thumbnail": {
    "isActive": true,
    "position": "bottom-center",
    "fit": "cover",
    "align": "center",
    "triggers": "click",
    "grid": {
      "height": 60,
      "gap": 8
    },
    "offset": { "x": 0, "y": 0 },
    "opacity": 0.5,
    "activeScale": 1,
    "activeOpacity": 1
  },
  "layout": {
    "position": "middle-center",
    "offset": { "x": 0, "y": 0 },
    "padding": { "top": 200, "right": 0, "bottom": 200, "left": 0 }
  },
  "controls": {
    "isActive": true,
    "arrowsImgUrl": "https://cdn.cntrl.site/projects/01GJ2SPDSH73MC92WW7ZA2CWBY/articles-assets/01K8JFX7BWTRKEBAEC5GN0V47B.png",
    "offset": { "x": 0, "y": 0 },
    "scale": 100,
    "color": "#000000",
    "hover": "#cccccc"
  },
  "area": {
    "padding": { "top": 0, "right": 0, "bottom": 0, "left": 0 },
    "color": "rgba(0,0,0,0.8)",
    "blur": 5,
    "closeIconUrl": null,
    "closeIconAlign": "top-right",
    "closeIconOffset": { "x": 12, "y": 12 }
  },
  "caption": {
    "alignment": "middle-center",
    "color": "#000000",
    "offset": { "x": 0, "y": 0 },
    "hover": "#cccccc"
  }
};
const styles = {
  "caption": {
    "widthSettings": {
      "width": 0.13,
      "sizing": "auto"
    },
    "fontSettings": {
      "fontFamily": "Arial",
      "fontWeight": 400,
      "fontStyle": "normal"
    },
    "fontSizeLineHeight": {
      "fontSize": 0.02,
      "lineHeight": 0.02
    },
    "letterSpacing": 0,
    "wordSpacing": 0,
    "textAlign": "left",
    "textAppearance": {
      "textTransform": "none",
      "textDecoration": "none",
      "fontVariant": "normal"
    },
    "color": "#000000"
  }
};

const content = [
  {
    "image": {
      "objectFit": "contain",
      "url": "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERMHNP08T27H1649S67NZV.png",
      "name": "Slider-1.png"
    },
    "imageCaption": [
      {
        "type": "paragraph",
        "children": [
          {
            "text": ""
          }
        ]
      }
    ]
  },
  {
    "image": {
      "objectFit": "contain",
      "url": "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERMTZA3RYMXKF0M095D6JD.png",
      "name": "Slider-2.png"
    },
    "imageCaption": [
      {
        "type": "paragraph",
        "children": [
          {
            "text": ""
          }
        ]
      }
    ]
  },
  {
    "image": {
      "objectFit": "contain",
      "url": "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERMVSCMPVJBG2WF5KJZYHZ.png",
      "name": "Slider-3.png"
    },
    "imageCaption": [
      {
        "type": "paragraph",
        "children": [
          {
            "text": ""
          }
        ]
      }
    ]
  }
];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div id="portal-target"></div>
    <div style={{ width: '400px', height: '500px' }}>
      <LightboxGallery settings={settings} content={content} styles={styles} portalId="portal-target" />
    </div>
  </React.StrictMode>
);
