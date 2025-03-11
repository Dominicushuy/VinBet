// src/components/ui/lightbox.jsx
'use client'

import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

const LightboxComponent = ({ open, close, slides, plugins = [] }) => {
  return (
    <Lightbox
      open={open}
      close={close}
      slides={slides}
      plugins={plugins}
      controller={{ closeOnBackdropClick: true }}
      carousel={{ finite: true }}
      animation={{ swipe: 250 }}
      className='bg-black/80 backdrop-blur-sm'
    />
  )
}

export default LightboxComponent
