import Link from 'next/link'

export function AdminFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='border-t py-4 bg-background print:hidden'>
      <div className='container flex flex-col sm:flex-row items-center justify-between px-4 md:px-6'>
        <div className='flex items-center mb-2 sm:mb-0'>
          <p className='text-sm text-muted-foreground'>&copy; {currentYear} VinBet. Tất cả quyền được bảo lưu.</p>
        </div>

        <nav aria-label='Footer Navigation'>
          <ul className='flex items-center space-x-2 sm:space-x-4 text-sm text-muted-foreground'>
            <li>
              <Link href='/admin/support' className='hover:text-foreground transition-colors px-2 py-1'>
                Trợ giúp
              </Link>
            </li>
            <li className='text-muted-foreground'>•</li>
            <li>
              <Link href='/admin/terms' className='hover:text-foreground transition-colors px-2 py-1'>
                Điều khoản
              </Link>
            </li>
            <li className='text-muted-foreground'>•</li>
            <li>
              <Link href='/admin/privacy' className='hover:text-foreground transition-colors px-2 py-1'>
                Bảo mật
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
