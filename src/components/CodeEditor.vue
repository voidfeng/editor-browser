<template>
  <div ref="editorRef" class="code-editor"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from '@codemirror/view'
import { EditorState, type Extension } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { indentOnInput, bracketMatching } from '@codemirror/language'
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap
} from '@codemirror/autocomplete'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

interface Props {
  modelValue?: string
  language?: 'javascript' | 'html' | 'css' | 'json' | 'markdown'
  theme?: 'light' | 'dark'
  readonly?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  language: 'javascript',
  theme: 'light',
  readonly: false,
  placeholder: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = ref<HTMLElement>()
let editorView: EditorView | null = null

// 语言支持映射
const getLanguageSupport = (lang: string) => {
  switch (lang) {
    case 'javascript':
      return javascript()
    default:
      return javascript()
  }
}

// 基础扩展
const basicExtensions: Extension[] = [
  lineNumbers(),
  highlightActiveLineGutter(),
  history(),
  indentOnInput(),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...completionKeymap])
]

// 创建编辑器状态
const createEditorState = () => {
  const extensions = [
    ...basicExtensions,
    getLanguageSupport(props.language),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newValue = update.state.doc.toString()
        emit('update:modelValue', newValue)
      }
    })
  ]

  // 添加主题
  if (props.theme === 'dark') {
    extensions.push(oneDark)
  }

  // 只读模式
  if (props.readonly) {
    extensions.push(EditorState.readOnly.of(true))
  }

  return EditorState.create({
    doc: props.modelValue,
    extensions
  })
}

// 初始化编辑器
onMounted(() => {
  if (!editorRef.value) return

  editorView = new EditorView({
    state: createEditorState(),
    parent: editorRef.value
  })
})

// 清理编辑器
onUnmounted(() => {
  editorView?.destroy()
})

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (editorView && newValue !== editorView.state.doc.toString()) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: newValue
        }
      })
    }
  }
)

// 监听语言变化
watch(
  () => props.language,
  () => {
    if (editorView) {
      const newState = createEditorState()
      editorView.setState(newState)
    }
  }
)

// 监听主题变化
watch(
  () => props.theme,
  () => {
    if (editorView) {
      const newState = createEditorState()
      editorView.setState(newState)
    }
  }
)
</script>

<style scoped>
.code-editor {
  border: none;
  overflow: hidden;
  background: var(--vscode-editor-bg);
}

.code-editor :deep(.cm-editor) {
  height: 100%;
  background: var(--vscode-editor-bg);
}

.code-editor :deep(.cm-focused) {
  outline: none;
}

.code-editor :deep(.cm-gutters) {
  background: var(--vscode-editor-bg);
  border-right: 1px solid var(--vscode-border-primary);
}

.code-editor :deep(.cm-lineNumbers) {
  color: var(--vscode-editor-line-number);
}
</style>
