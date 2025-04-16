import BaseNode from './baseNode';

const QuestionNode = ({ data }: any) => (
  <BaseNode backgroundColor="bg-yellow-50" borderColor="border-yellow-300" icon="❓">
    <p className="font-medium text-yellow-900">{data.text || 'Pregunta'}</p>
    <ul className="mt-2 text-sm text-yellow-800 list-disc list-inside">
      {(data.options || []).map((opt: string, i: number) => (
        <li key={i}>{opt}</li>
      ))}
    </ul>
  </BaseNode>
);

export default QuestionNode;
