import { FlagForm } from "@/components/flag-form"

export default function EditFlagPage({ params }: { params: { key: string } }) {
  return <FlagForm mode="edit" flagKey={decodeURIComponent(params.key)} />
}
