import { Link, createFileRoute } from '@tanstack/react-router'
import { listQuestions } from '#/admin/questions.functions'
import { Button } from '#/components/ui/button'
import { questionTypeLabels } from '#/questions/question-types'

export const Route = createFileRoute('/admin/')({
  loader: () => listQuestions(),
  component: QuestionList,
})

type Question = Awaited<ReturnType<typeof listQuestions>>[number]

function publicationLabel(question: Question) {
  if (question.publishedVersion === null) return 'Draft'
  const version = `Published v${question.publishedVersion}`
  return question.hasUnpublishedChanges ? `${version}, unpublished changes` : version
}

function QuestionList() {
  const questions = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Questions</h1>
        <Button asChild>
          <Link to="/admin/questions/new">New question</Link>
        </Button>
      </div>

      {questions.length === 0 ? (
        <p className="text-muted-foreground">No question yet.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 font-medium">Type</th>
              <th className="py-2 font-medium">Languages</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id} className="border-b border-border">
                <td className="py-2">
                  <Link
                    to="/admin/questions/$questionId"
                    params={{ questionId: question.id }}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {question.name}
                  </Link>
                </td>
                <td className="py-2">{questionTypeLabels[question.type]}</td>
                <td className="py-2 uppercase">{question.locales.join(', ')}</td>
                <td className="py-2">{publicationLabel(question)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
