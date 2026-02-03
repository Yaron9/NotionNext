import { AdSlot } from '@/components/GoogleAdsense'
import replaceSearchResult from '@/components/Mark'
import NotionPage from '@/components/NotionPage'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isBrowser } from '@/lib/utils'
import dynamic from 'next/dynamic'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useRef } from 'react'
import BlogPostBar from './components/BlogPostBar'
import { BlogItem } from './components/BlogItem'
import ShareBar from '@/components/ShareBar'
import CONFIG from './config'
import { Style } from './style'
import Catalog from './components/Catalog'

const AlgoliaSearchModal = dynamic(
  () => import('@/components/AlgoliaSearchModal'),
  { ssr: false }
)

// 主题组件

const BlogArchiveItem = dynamic(() => import('./components/BlogArchiveItem'), {
  ssr: false
})
const ArticleLock = dynamic(() => import('./components/ArticleLock'), {
  ssr: false
})
const ArticleInfo = dynamic(() => import('./components/ArticleInfo'), {
  ssr: false
})
const Comment = dynamic(() => import('@/components/Comment'), { ssr: false })
const ArticleAround = dynamic(() => import('./components/ArticleAround'), {
  ssr: false
})
const TopBar = dynamic(() => import('./components/TopBar'), { ssr: false })
const NavBar = dynamic(() => import('./components/NavBar'), { ssr: false })
const JumpToTopButton = dynamic(() => import('./components/JumpToTopButton'), {
  ssr: false
})
const Footer = dynamic(() => import('./components/Footer'), { ssr: false })
const WWAds = dynamic(() => import('@/components/WWAds'), { ssr: false })
const BlogListPage = dynamic(() => import('./components/BlogListPage'), {
  ssr: false
})
const RecommendPosts = dynamic(() => import('./components/RecommendPosts'), {
  ssr: false
})

// 主题全局状态
const ThemeGlobalSimple = createContext()
export const useSimpleGlobal = () => useContext(ThemeGlobalSimple)

/**
 * 基础布局
 *
 * @param {*} props
 * @returns
 */
const LayoutBase = props => {
  const { children } = props
  const { onLoading, fullWidth } = useGlobal()
  // const onLoading = true
  const searchModal = useRef(null)

  return (
    <ThemeGlobalSimple.Provider value={{ searchModal }}>
      <div
        id='theme-typography'
        className={`${siteConfig('FONT_STYLE')} font-typography h-screen flex flex-col dark:text-gray-300 bg-white dark:bg-[#232222] overflow-hidden`}>
        <Style />

        {siteConfig('SIMPLE_TOP_BAR', null, CONFIG) && <TopBar {...props} />}

        <div className='flex flex-1 mx-auto overflow-hidden py-8 md:p-0 md:max-w-7xl md:px-24 w-screen'>
          {/* 主体 - 使用 flex 布局 */}
          {/* 文章详情才显示 */}
          {/* {props.post && (
            <div className='mt-20 hidden md:block md:fixed md:left-5 md:w-[300px]'>
              <Catalog {...props} />
            </div>
          )} */}
          <div className='overflow-hidden md:mt-20 flex-1 '>
            {/* 左侧内容区域 - 可滚动 */}
            <div
              id='container-inner'
              className='h-full w-full md:px-24 overflow-y-auto scroll-hidden relative'>
              {/* 移动端导航 - 显示在顶部 */}
              <div className='md:hidden'>
                <NavBar {...props} />
              </div>
              {onLoading ? (
                // loading 时显示 spinner
                <div className='flex items-center justify-center min-h-[500px] w-full'>
                  <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white'></div>
                </div>
              ) : (
                <>{children}</>
              )}
              <AdSlot type='native' />
              {/* 移动端页脚 - 显示在底部 */}
              <div className='md:hidden  z-30  '>
                <Footer {...props} />
              </div>
            </div>
          </div>

          {/* 右侧导航和页脚 - 固定不滚动 */}
          <div className='hidden md:flex md:flex-col md:flex-shrink-0 md:h-[100vh] sticky top-20'>
            <NavBar {...props} />
            <Footer {...props} />
          </div>
        </div>

        <div className='fixed right-4 bottom-4 z-20'>
          <JumpToTopButton />
        </div>

        {/* 搜索框 */}
        <AlgoliaSearchModal cRef={searchModal} {...props} />
      </div>
    </ThemeGlobalSimple.Provider>
  )
}

/**
 * 按分类分组文章
 */
function groupArticlesByCategory(articles) {
  const grouped = {}
  for (const article of articles) {
    const cat = article.category || '未分类'
    if (!grouped[cat]) {
      grouped[cat] = []
    }
    grouped[cat].push(article)
  }
  return Object.entries(grouped).map(([category, posts]) => ({ category, posts }))
}

/**
 * 博客首页
 * 结构：最新发布（hero）→ 推荐阅读 → 全部文章（时间倒序）
 */
const LayoutIndex = props => {
  const { posts } = props
  const allPosts = posts || []

  // 最新一篇突出展示
  const latestPost = allPosts[0]

  // 推荐阅读：Notion 中标记「推荐」标签的文章
  const recommendedPosts = allPosts.filter(
    p => p.tags && p.tags.includes('推荐')
  )

  // 剩余文章（跳过 hero 避免重复）
  const restPosts = allPosts.slice(1)

  return (
    <>
      <div className='w-full md:pr-8 mb-12 px-5'>

        {/* ---- 分类导航 ---- */}
        {props.categoryOptions && props.categoryOptions.length > 0 && (
          <div className='flex flex-wrap gap-3 mb-10 pb-4 border-b border-gray-200 dark:border-gray-700'>
            {props.categoryOptions.map(cat => (
              <SmartLink
                key={cat.name}
                href={'/category/' + cat.name}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border-2 border-[var(--primary-color)] dark:border-gray-400 text-[var(--primary-color)] dark:text-gray-200 hover:bg-[var(--primary-color)] hover:text-white dark:hover:bg-gray-600 transition-all duration-200 no-underline'>
                <i className='fa-regular fa-folder' />
                {cat.name}
                <span className='opacity-50'>({cat.count})</span>
              </SmartLink>
            ))}
          </div>
        )}

        {/* ---- 最新发布 Hero ---- */}
        {latestPost && (
          <div className='mb-12'>
            <h2 className='text-xl font-extrabold pb-2 mb-4 text-[var(--primary-color)] dark:text-gray-100 border-b-2 border-[var(--primary-color)] dark:border-gray-500'>
              <i className='fa-solid fa-bolt mr-2' />最新发布
            </h2>
            <div id='posts-wrapper'>
              <BlogItem post={latestPost} />
            </div>
          </div>
        )}

        {/* ---- 推荐阅读 ---- */}
        {recommendedPosts.length > 0 && (
          <div className='mb-12'>
            <h2 className='text-xl font-extrabold pb-2 mb-4 text-[var(--primary-color)] dark:text-gray-100 border-b-2 border-[var(--primary-color)] dark:border-gray-500'>
              <i className='fa-solid fa-star mr-2' />推荐阅读
            </h2>
            <div id='posts-wrapper'>
              {recommendedPosts.map(p => (
                <BlogItem key={p.id} post={p} />
              ))}
            </div>
          </div>
        )}

        {/* ---- 关于我 ---- */}
        <div className='mb-12'>
          <h2 className='text-xl font-extrabold pb-2 mb-4 text-[var(--primary-color)] dark:text-gray-100 border-b-2 border-[var(--primary-color)] dark:border-gray-500'>
            <i className='fa-solid fa-user mr-2' />关于我
          </h2>
          <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-5 bg-gray-50/80 dark:bg-gray-800/60'>
            <div className='space-y-2.5 text-sm'>
              <div className='flex items-center gap-2'>
                <span>🎙️</span>
                <span className='font-bold text-gray-700 dark:text-gray-300'>播客</span>
                <span className='text-gray-400'>|</span>
                <span className='text-gray-600 dark:text-gray-400'>遇见大王2025（小宇宙）</span>
              </div>
              <div className='flex items-center gap-2'>
                <span>📝</span>
                <span className='font-bold text-gray-700 dark:text-gray-300'>公众号</span>
                <span className='text-gray-400'>|</span>
                <span className='text-gray-600 dark:text-gray-400'>遇见大王2025</span>
              </div>
              <div className='flex items-center gap-2'>
                <span>🌐</span>
                <span className='font-bold text-gray-700 dark:text-gray-300'>博客</span>
                <span className='text-gray-400'>|</span>
                <a href='https://aidawang.de5.net' target='_blank' rel='noopener noreferrer' className='text-[var(--primary-color)] hover:underline'>aidawang.de5.net</a>
              </div>
              <div className='flex items-center gap-2'>
                <span>📮</span>
                <span className='font-bold text-gray-700 dark:text-gray-300'>邮箱</span>
                <span className='text-gray-400'>|</span>
                <a href='mailto:yaron999999@gmail.com' className='text-[var(--primary-color)] hover:underline'>yaron999999@gmail.com</a>
              </div>
              <div className='flex items-center gap-2'>
                <span>🐙</span>
                <span className='font-bold text-gray-700 dark:text-gray-300'>GitHub</span>
                <span className='text-gray-400'>|</span>
                <a href='https://github.com/Yaron9' target='_blank' rel='noopener noreferrer' className='text-[var(--primary-color)] hover:underline'>github.com/Yaron9</a>
              </div>
              <div className='flex items-center gap-2'>
                <span>⭐</span>
                <span className='font-bold text-gray-700 dark:text-gray-300'>推荐项目</span>
                <span className='text-gray-400'>|</span>
                <span className='text-gray-600 dark:text-gray-400'>MetaMe — </span>
                <a href='https://github.com/Yaron9/MetaMe' target='_blank' rel='noopener noreferrer' className='text-[var(--primary-color)] hover:underline'>github.com/Yaron9/MetaMe</a>
              </div>
            </div>
            <p className='mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-500 dark:text-gray-400'>
              全球AI咨询早知道 · 用 AI 过好每一天
            </p>
          </div>
        </div>

        {/* ---- 全部文章（按时间倒序） ---- */}
        {restPosts.length > 0 && (
          <div className='mb-8'>
            <h2 className='text-xl font-extrabold pb-2 mb-4 text-[var(--primary-color)] dark:text-gray-100 border-b-2 border-[var(--primary-color)] dark:border-gray-500'>
              <i className='fa-regular fa-newspaper mr-2' />全部文章
            </h2>
            <div id='posts-wrapper'>
              {restPosts.map(p => (
                <BlogItem key={p.id} post={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
/**
 * 博客列表
 * @param {*} props
 * @returns
 */
const LayoutPostList = props => {
  return (
    <>
      <BlogPostBar {...props} />
      <BlogListPage {...props} />
    </>
  )
}

/**
 * 搜索页
 * 也是博客列表
 * @param {*} props
 * @returns
 */
const LayoutSearch = props => {
  const { keyword } = props

  useEffect(() => {
    if (isBrowser) {
      replaceSearchResult({
        doms: document.getElementById('posts-wrapper'),
        search: keyword,
        target: {
          element: 'span',
          className: 'text-red-500 border-b border-dashed'
        }
      })
    }
  }, [])

  return <LayoutPostList {...props} />
}

 function groupArticlesByYearArray(articles) {
  const grouped = {};

  for (const article of articles) {
    const year = new Date(article.publishDate).getFullYear().toString();
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(article);
  }

  for (const year in grouped) {
    grouped[year].sort((a, b) => b.publishDate - a.publishDate);
  }

  // 转成数组并按年份倒序
  return Object.entries(grouped)
    .sort(([a], [b]) => b - a)
    .map(([year, posts]) => ({ year, posts }));
}



/**
 * 归档页
 * @param {*} props
 * @returns
 */
const LayoutArchive = props => {
  const { posts } = props
  const sortPosts = groupArticlesByYearArray(posts)
  return (
    <>
      <div className='mb-10 pb-20 md:pb-12 p-5  min-h-screen w-full'>
        {sortPosts.map(p => (
          <BlogArchiveItem
            key={p.year}
            archiveTitle={p.year}
            archivePosts={p.posts}
          />
        ))}
      </div>
    </>
  )
}

/**
 * 文章详情
 * @param {*} props
 * @returns
 */
const LayoutSlug = props => {
  const { post, lock, validPassword, prev, next, recommendPosts } = props
  const { fullWidth } = useGlobal()

  return (
    <>
      {lock && <ArticleLock validPassword={validPassword} />}

      {!lock && post && (
        <div
          className={`px-5 pt-3 ${fullWidth ? '' : 'xl:max-w-4xl 2xl:max-w-6xl'}`}>
          {/* 文章信息 */}
          <ArticleInfo post={post} />

          {/* 广告嵌入 */}
          {/* <AdSlot type={'in-article'} /> */}
          <WWAds orientation='horizontal' className='w-full' />

          <div id='article-wrapper' className='rounded-lg p-4 md:p-6' style={{ backgroundColor: 'rgba(255, 248, 240, 0.5)' }}>
            {/* Notion 文章主体 */}
            {!lock && <NotionPage post={post} />}
          </div>

          {/* 分享 */}
          <ShareBar post={post} />

          {/* 广告嵌入 */}
          <AdSlot type={'in-article'} />

          {post?.type === 'Post' && (
            <div className='bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 mt-4'>
              <ArticleAround prev={prev} next={next} />
              <RecommendPosts recommendPosts={recommendPosts} />
            </div>
          )}

          {/* 评论区 */}
          <div className='bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 mt-4'>
            <Comment frontMatter={post} />
          </div>
        </div>
      )}
    </>
  )
}

/**
 * 404
 * @param {*} props
 * @returns
 */
const Layout404 = props => {
  const { post } = props
  const router = useRouter()
  const waiting404 = siteConfig('POST_WAITING_TIME_FOR_404') * 1000
  useEffect(() => {
    // 404
    if (!post) {
      setTimeout(() => {
        if (isBrowser) {
          const article = document.querySelector(
            '#article-wrapper #notion-article'
          )
          if (!article) {
            router.push('/404').then(() => {
              console.warn('找不到页面', router.asPath)
            })
          }
        }
      }, waiting404)
    }
  }, [post])
  return <>404 Not found.</>
}

/**
 * 分类列表
 * @param {*} props
 * @returns
 */
const LayoutCategoryIndex = props => {
  const { categoryOptions } = props
  return (
    <>
      <div id='category-list' className='px-5 duration-200 flex flex-wrap'>
        {categoryOptions?.map(category => {
          return (
            <SmartLink
              key={category.name}
              href={`/category/${category.name}`}
              passHref
              legacyBehavior>
              <div
                className={
                  'hover:text-black dark:hover:text-white dark:text-gray-300 dark:hover:bg-gray-600 px-5 cursor-pointer py-2 hover:bg-gray-100'
                }>
                <i className='mr-4 fas fa-folder' />
                {category.name}({category.count})
              </div>
            </SmartLink>
          )
        })}
      </div>
    </>
  )
}

/**
 * 标签列表
 * @param {*} props
 * @returns
 */
const LayoutTagIndex = props => {
  const { tagOptions } = props
  return (
    <>
      <div id='tags-list' className='px-5 duration-200 flex flex-wrap'>
        {tagOptions.map(tag => {
          return (
            <div key={tag.name} className='p-2'>
              <SmartLink
                key={tag}
                href={`/tag/${encodeURIComponent(tag.name)}`}
                passHref
                className={`cursor-pointer inline-block rounded hover:bg-gray-500 hover:text-white duration-200  mr-2 py-1 px-2 text-xs whitespace-nowrap dark:hover:text-white text-gray-600 hover:shadow-xl dark:border-gray-400 notion-${tag.color}_background dark:bg-gray-800`}>
                <div className='font-light dark:text-gray-400'>
                  <i className='mr-1 fas fa-tag' />{' '}
                  {tag.name + (tag.count ? `(${tag.count})` : '')}{' '}
                </div>
              </SmartLink>
            </div>
          )
        })}
      </div>
    </>
  )
}

export {
  Layout404,
  LayoutArchive,
  LayoutBase,
  LayoutCategoryIndex,
  LayoutIndex,
  LayoutPostList,
  LayoutSearch,
  LayoutSlug,
  LayoutTagIndex,
  CONFIG as THEME_CONFIG
}


