import { BeiAnGongAn } from '@/components/BeiAnGongAn'
import DarkModeButton from '@/components/DarkModeButton'
import { siteConfig } from '@/lib/config'

/**
 * 页脚
 * @param {*} props
 * @returns
 */
export default function Footer(props) {
  return (
    <footer>
      <DarkModeButton className='pt-4' />

      <div className='font-bold text-[var(--primary-color)] dark:text-white py-6 text-sm flex flex-col gap-2 items-center'>
        <div>
          &copy;2025-2035 {siteConfig('AUTHOR')}.
        </div>
        <div>All rights reserved.</div>
      </div>
    </footer>
  )
}
