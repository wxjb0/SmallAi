import type { RoleDefinition } from './types'
import { Sparkles, Terminal, Feather, Heart, Languages } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const ROLE_ICONS: Record<string, LucideIcon> = {
  default: Sparkles,
  coder: Terminal,
  writer: Feather,
  psychologist: Heart,
  translator: Languages,
}

export const ROLE_COLORS: Record<string, string> = {
  default: '#6366f1',
  coder: '#10b981',
  writer: '#f59e0b',
  psychologist: '#ec4899',
  translator: '#3b82f6',
}

export const ROLES: RoleDefinition[] = [
  {
    id: 'default',
    name: '通用助手',
    description: '全能型 AI 伙伴，随时为你解答',
    icon: '✦',
    systemPrompt: '',
  },
  {
    id: 'coder',
    name: '编程助手',
    description: '精通代码，化繁为简',
    icon: '⌘',
    systemPrompt:
      '你是一个专业的编程助手。你擅长编写、调试和解释代码。回答时优先提供代码示例，并解释关键逻辑。使用 Markdown 格式化代码。',
  },
  {
    id: 'writer',
    name: '写作助手',
    description: '以笔为刃，字字珠玑',
    icon: '✎',
    systemPrompt:
      '你是一个专业的写作助手。你擅长各类文案写作、文章创作和创意写作。回答时注重文字的优美和逻辑的清晰。',
  },
  {
    id: 'psychologist',
    name: '心理顾问',
    description: '温暖陪伴，倾听心声',
    icon: '♡',
    systemPrompt:
      '你是一个温暖、有同理心的心理顾问。你善于倾听，提供情感支持和建设性建议。不要急于给出解决方案，先理解对方的感受。',
  },
  {
    id: 'translator',
    name: '翻译助手',
    description: '跨越语言，连接世界',
    icon: 'あ',
    systemPrompt:
      '你是一个专业的翻译助手。当用户输入中文时翻译为英文，输入英文时翻译为中文。同时提供翻译说明和文化注释。',
  },
]

export function getRoleById(id: string): RoleDefinition {
  return ROLES.find((r) => r.id === id) ?? ROLES[0]
}
