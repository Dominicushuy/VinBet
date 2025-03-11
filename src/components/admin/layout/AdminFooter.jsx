import Link from 'next/link'

export function AdminFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='border-t py-4 bg-background'>
      <div className='container flex flex-col sm:flex-row items-center justify-between px-4 md:px-6'>
        <div className='flex items-center'>
          <p className='text-sm text-muted-foreground'>&copy; {currentYear} VinBet. Tất cả quyền được bảo lưu.</p>
        </div>

        <div className='flex items-center space-x-4 mt-2 sm:mt-0 text-sm text-muted-foreground'>
          <Link href='/admin/support' className='hover:text-foreground transition-colors'>
            Trợ giúp
          </Link>
          <span>•</span>
          <Link href='/admin/terms' className='hover:text-foreground transition-colors'>
            Điều khoản
          </Link>
          <span>•</span>
          <Link href='/admin/privacy' className='hover:text-foreground transition-colors'>
            Bảo mật
          </Link>
        </div>
      </div>
    </footer>
  )
}
