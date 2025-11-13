import React from 'react';
import ReactDOM from 'react-dom/client';
import { LightboxGallery } from '../src/Components/Lightbox/Lightbox';

const settings = {
  "thumbnailBlock": {
    "cover": {
      "url": "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERMHNP08T27H1649S67NZV.png"
    },
  },
  "lightboxBlock": {
    "appear": {
      "type": "slide in",
      "duration": "500ms",
      "direction": "right",
      "repeat": "close"
    },
    "triggers": {
      "type": "click",
      "switch": "50/50",
      "duration": "2000ms"
    },
    "slider": {
      "type": "slide",
      "direction": "vert"
    },
    "thumbnail": {
      "isActive": true,
      "position": "middle-start",
      "fit": "fit",
      "align": "end",
      "triggers": "click",
      "grid": {
        "height": 60,
        "width": 60,
        "gap": 8
      },
      "offset": { "x": 0, "y": 0 },
      "opacity": 0.5,
      "activeState": {
        "scale": 1,
        "opacity": 1
      }
    },
    "layout": {
      "position": "middle-center",
      "offset": { "x": 0, "y": 0 },
      "padding": { "top": 20, "right": 0, "bottom": 20, "left": 0 }
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
      "isActive": true,
      "alignment": "middle-center",
      "color": "#FAC000",
      "offset": { "x": 100, "y": 100 },
      "hover": "#cccccc"
    }
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
            "text": "old brick 1"
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
            "text": "new york city 2"
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
            "text": "broadway 3"
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
      <LightboxGallery settings={settings} content={content} styles={styles} portalId="portal-target" activeEvent="open" />
    </div>
  </React.StrictMode>
);
