export default function ChatMessage({ role, content }) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
          <span className="text-white dark:text-gray-900 text-xs font-semibold">Y</span>
        </div>
      )}
      <div
        className={`max-w-[72%] px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
        }`}
      >
        {content}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center ml-2 mt-0.5 flex-shrink-0">
          <span className="text-gray-600 dark:text-gray-300 text-xs font-semibold">U</span>
        </div>
      )}
    </div>
  )
}
