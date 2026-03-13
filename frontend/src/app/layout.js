// import "./globals.css";
// import Link from "next/link";

// export const metadata = {
//   title: "AI Assistant",
//   description: "Smart AI-powered assistant",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className="bg-black text-white overflow-hidden">

        

//         {/* Content */}
//         <div className="flex items-center justify-center min-h-screen px-6">

//           <div className="max-w-3xl text-center space-y-6">

//             <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
//               AI Assistant Platform
//             </h1>

//             <p className="text-gray-300 text-lg">
//               A smart AI-powered assistant that helps you search information,
//               chat with documents, generate images, and get instant answers
//               using advanced artificial intelligence.
//             </p>

//             <div className="flex justify-center gap-5 pt-4">

//               <Link href="/register">
//                 <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">
//                   Register
//                 </button>
//               </Link>

//               <Link href="/login">
//                 <button className="px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg font-semibold transition">
//                   Login
//                 </button>
//               </Link>

//             </div>

//           </div>

//         </div>

//         {children}

//       </body>
//     </html>
//   );
// }




import "./globals.css";

export const metadata = {
  title: "AI Assistant",
  description: "Smart AI-powered assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}