import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

/**
 * Twikoo评论组件
 * @returns {JSX.Element}
 */

const Twikoo = ({ isDarkMode }) => {
  const envId = siteConfig('COMMENT_TWIKOO_ENV_ID')
  const el = siteConfig('COMMENT_TWIKOO_ELEMENT_ID', '#twikoo')
  const twikooCDNURL = siteConfig('COMMENT_TWIKOO_CDN_URL')
  const lang = siteConfig('LANG')
  const [isInit] = useState(useRef(false))

  const loadTwikoo = async () => {
    try {
      await loadExternalResource(twikooCDNURL, 'js')
      const twikoo = window?.twikoo
      if (
        typeof twikoo !== 'undefined' &&
        twikoo &&
        typeof twikoo.init === 'function'
      ) {
        twikoo.init({
          envId: envId,
          el: el,
          lang: lang
        })
        console.log('twikoo init', twikoo)
        isInit.current = true
      }
    } catch (error) {
      console.error('twikoo 加载失败', error)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (isInit.current) {
        console.log('twikoo init! clear interval')
        clearInterval(interval)
      } else {
        loadTwikoo()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [isDarkMode])

  return (
    <div>
      <p className='text-center text-sm text-gray-500 dark:text-gray-400 mb-2'>
        欢迎留言，期待你的想法 ✨
      </p>
      <div id="twikoo"></div>
    </div>
  )
}

export default Twikoo
