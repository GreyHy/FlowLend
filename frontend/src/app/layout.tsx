import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RangeLend - 区间流动性借贷",
  description: "一种基于自定义年化收益率（APR）区间的创新借贷协议",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <header className="border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              RangeLend
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/lend" className="hover:text-blue-600">出借</Link>
              <Link href="/borrow" className="hover:text-blue-600">借款</Link>
              <Link href="/dashboard" className="hover:text-blue-600">仪表盘</Link>
            </nav>
            <div>
              <button className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                连接钱包
              </button>
            </div>
          </div>
        </header>
        {children}
        <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4">RangeLend</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  一种基于自定义年化收益率（APR）区间的创新借贷协议
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4">链接</h3>
                <ul className="space-y-2">
                  <li><Link href="/lend" className="hover:text-blue-600">出借</Link></li>
                  <li><Link href="/borrow" className="hover:text-blue-600">借款</Link></li>
                  <li><Link href="/dashboard" className="hover:text-blue-600">仪表盘</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4">资源</h3>
                <ul className="space-y-2">
                  <li><Link href="/docs" className="hover:text-blue-600">文档</Link></li>
                  <li><Link href="/faq" className="hover:text-blue-600">常见问题</Link></li>
                  <li><a href="https://github.com/your-repo/rangelend" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">GitHub</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
              <p>&copy; {new Date().getFullYear()} RangeLend. 保留所有权利。</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
