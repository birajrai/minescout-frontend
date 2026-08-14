import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  LinkIcon,
  Undo2,
  Redo2,
} from 'lucide-react'

function ToolbarBtn({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center size-8 rounded-sm border transition-colors ${
        active
          ? 'border-primary bg-primary/20 text-primary'
          : 'border-transparent text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
      } disabled:opacity-40 disabled:pointer-events-none`}
    >
      {children}
    </button>
  )
}

function setLink(editor: Editor) {
  const prev = editor.getAttributes('link').href as string | undefined
  const url = window.prompt('Link URL', prev ?? 'https://')
  if (url === null) return
  if (url === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = '12rem',
  maxLength = 10000,
}: {
  value: string
  onChange: (markdown: string) => void
  placeholder?: string
  minHeight?: string
  maxLength?: number
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? 'Write a rich description…' }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-stone dark:prose-invert max-w-none text-sm text-stone-800 dark:text-stone-200 focus:outline-none min-h-full px-3 py-2',
      },
    },
    onCreate: ({ editor }) => {
      if (value) editor.commands.setContent(value, { contentType: 'markdown' })
    },
    onUpdate: ({ editor: e }) => {
      const markdown = e.getMarkdown()
      if (markdown.length <= maxLength) {
        onChange(markdown)
      } else {
        e.chain().undo().run()
      }
    },
  })

  const chars = editor ? editor.getText().trim().length : 0

  return (
    <div className="flex flex-col rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 overflow-hidden focus-within:ring-2 focus-within:ring-primary">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-stone-300 dark:border-stone-700 bg-stone-200/70 dark:bg-stone-800">
        <ToolbarBtn active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()} label="Bold">
          <Bold className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()} label="Italic">
          <Italic className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('strike')} onClick={() => editor?.chain().focus().toggleStrike().run()} label="Strikethrough">
          <Strikethrough className="size-4" />
        </ToolbarBtn>
        <div className="w-px h-5 bg-stone-400/40 dark:bg-stone-600/40 mx-1" />
        <ToolbarBtn active={editor?.isActive('heading', { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} label="Heading 2">
          <Heading2 className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('heading', { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} label="Heading 3">
          <Heading3 className="size-4" />
        </ToolbarBtn>
        <div className="w-px h-5 bg-stone-400/40 dark:bg-stone-600/40 mx-1" />
        <ToolbarBtn active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()} label="Bullet list">
          <List className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()} label="Numbered list">
          <ListOrdered className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()} label="Quote">
          <Quote className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('codeBlock')} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} label="Code block">
          <Code className="size-4" />
        </ToolbarBtn>
        <div className="w-px h-5 bg-stone-400/40 dark:bg-stone-600/40 mx-1" />
        <ToolbarBtn active={editor?.isActive('link')} onClick={() => editor && setLink(editor)} label="Link">
          <LinkIcon className="size-4" />
        </ToolbarBtn>
        <div className="flex-1" />
        <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} label="Undo" disabled={!editor?.can().undo()}>
          <Undo2 className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} label="Redo" disabled={!editor?.can().redo()}>
          <Redo2 className="size-4" />
        </ToolbarBtn>
      </div>
      <div style={{ minHeight }} className="overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      <div className="px-3 py-1 text-xs text-stone-500 dark:text-stone-400 border-t border-stone-300 dark:border-stone-700 flex items-center justify-between">
        <span className="tiptap-char-count">{chars} characters</span>
        <span className="tiptap-char-limit">{maxLength.toLocaleString()} max</span>
      </div>
    </div>
  )
}
