import React from 'react'
import { assets } from '../assets/assets'

const AppDownload = () => {
  return (
    <div className='container px-4 2xl:px-20 mx-auto my-16'>
      <div className='relative bg-gradient-to-r from-violet-50 to-purple-50 p-8 sm:p-16 lg:p-20 rounded-lg overflow-hidden max-w-5xl mx-auto'>
        <div className='relative z-10'>
          <h1 className="text-xl sm:text-3xl font-bold mb-6 max-w-md">
            Download Mobile App For Better Experience.
          </h1>
          <div className='flex gap-3'>
            <a href="#" className='inline-block'>
              <img className='h-10' src={assets.play_store} alt="Play Store" />
            </a>
            <a href="#" className='inline-block'>
              <img className='h-10' src={assets.app_store} alt="App Store" />
            </a>
          </div>
        </div>

        {/* Image stays inside the box */}
        <img
          className='absolute w-64 right-0 bottom-0 mr-20 max-lg:hidden'
          src={assets.app_main_img}
          alt="App Preview"
        />
      </div>
    </div>
  )
}

export default AppDownload
