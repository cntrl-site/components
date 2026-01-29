import React from 'react';
import ReactDOM from 'react-dom/client';
import { ControlSlider } from '../src/Components/ControlSlider/ControlSlider.tsx'

const content = [
  {
    "image": {
      "objectFit": "cover",
      "url": "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERMHNP08T27H1649S67NZV.png",
      "name": "Slider-1.png"
    },
    "imageCaption": {
      "text": "dawbabdawdbawb\n",
      "blocks": [
        {
          "type": "unstyled",
          "start": 0,
          "end": 14,
          "entities": []
        }
      ],
      "layoutStyles": {
        "d": [
          {
            "start": 3,
            "end": 11,
            "style": "TEXTTRANSFORM",
            "value": "uppercase"
          },
          {
            "start": 3,
            "end": 11,
            "style": "FONTVARIANT",
            "value": "none"
          }
        ]
      }
    }
  },
  {
    "image": {
      "objectFit": "cover",
      "url": "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERMTZA3RYMXKF0M095D6JD.png",
      "name": "Slider-2.png"
    },
    "imageCaption": {
      "text": "",
      "blocks": [
        {
          "start": 0,
          "end": 0,
          "type": "unstyled",
          "entities": []
        }
      ],
      "layoutStyles": []
    }
  },
  {
    "image": {
      "objectFit": "cover",
      "url": "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERMVSCMPVJBG2WF5KJZYHZ.png",
      "name": "Slider-3.png"
    },
    "imageCaption": {
      "text": "",
      "blocks": [
        {
          "start": 0,
          "end": 0,
          "type": "unstyled",
          "entities": []
        }
      ],
      "layoutStyles": []
    }
  }
]

const settings = {
  "triggers": {
    "triggersList": {
      "click": false,
      "drag": true
    },
    "autoPlay": null
  },
  "controls": {
    "isActive": true,
    "arrowsImgUrl": null,
    "offset": {
      "x": 0,
      "y": 0
    },
    "scale": 100,
    "color": "#000000",
    "hover": "#cccccc",
    "show": "always"
  },
  "transition": {
    "type": "slide",
    "duration": "500ms",
    "backgroundColor": null
  },
  "pagination": {
    "isActive": true,
    "scale": 50,
    "position": "outside-1",
    "offset": {
      "x": 0,
      "y": 0
    },
    "colors": [
      "#cccccc",
      "#cccccc",
      "#000000"
    ],
    "hover": "#cccccc"
  },
  "direction": "horiz",
  "imageCaption": {
    "offset": {
      "x": 0,
      "y": 0
    },
    "isActive": true,
    "alignment": "middle-center",
    "hover": "#cccccc"
  }
}

const styles = {
  "imageCaption": {
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
}

const layouts = [
  {
    "id": "m",
    "title": "Mobile",
    "icon": "mobile-portrait",
    "fsPreview": false,
    "startsWith": 0,
    "exemplary": 375,
    "grid": {
      "columnWidth": 0.02666666666666667,
      "gutterWidth": 0.026666666666666665,
      "beatHeight": 0.032,
      "columnsAmount": 4,
      "beatMultiplier": 1,
      "maxWidth": 1
    },
    "disabled": false,
    "locked": true
  },
  {
    "id": "t",
    "title": "Tablet",
    "icon": "tablet-portrait",
    "fsPreview": false,
    "startsWith": 768,
    "exemplary": 768,
    "grid": {
      "columnWidth": 0.06944444444444445,
      "gutterWidth": 0.013888888888888888,
      "beatHeight": 0.006944444444444444,
      "columnsAmount": 12,
      "beatMultiplier": 4,
      "maxWidth": 1
    },
    "disabled": true,
    "locked": false
  },
  {
    "id": "d",
    "title": "Desktop",
    "icon": "desktop",
    "fsPreview": true,
    "startsWith": 1024,
    "exemplary": 1440,
    "grid": {
      "columnWidth": 0.008333333333333333,
      "gutterWidth": 0.014583333333333334,
      "beatHeight": 0.004861111111111111,
      "columnsAmount": 32,
      "beatMultiplier": 3,
      "maxWidth": null
    },
    "disabled": false,
    "locked": true
  }
]

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div style={{ position: 'relative', width: '400px', height: '400px' }}>
      <ControlSlider settings={settings} content={content} styles={styles} layouts={layouts} />
    </div>
  </React.StrictMode>
);
