import type { CodedResponse } from '../../../@types/CodedResponse'

type ResponseCardProps = {
  response: CodedResponse;
}

export default function ResponseCard({ response }: ResponseCardProps) {
  return (
    <div className="flex flex-col w-full p-4 border border-gray-300 rounded-md shadow-sm">
      {/* Question ID */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold">Question ID:</span>
        <span className="text-lg">{response.questionId}</span>
      </div>

      {/* Original Response */}
      <div className="mb-2">
        <span className="text-lg font-bold">Original Response:</span>
        <p className="text-gray-700">{response.originalResponse}</p>
      </div>

      {/* Invivo Codes */}
      <div className="mb-2">
        <span className="text-lg font-bold">Invivo Codes:</span>
        <p className="text-gray-700">{response.invivoCodes}</p>
      </div>

      {/* Descriptive Codes */}
      <div>
        <span className="text-lg font-bold">Descriptive Codes:</span>
        <ul className="list-disc list-inside text-gray-700">
          {response.descriptiveCodes.map((code, index) => (
            <li key={index}>
              <span className="font-semibold">{code.categoryPlainText}:</span> {code.categoryDescription}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}