import { PromptDetail } from '@/components/prompts/PromptDetail'

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="mx-auto max-w-4xl p-8">
      <PromptDetail promptId={id} />
    </div>
  )
}
