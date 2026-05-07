import { X } from 'lucide-react'
import { ROLES, ROLE_ICONS, ROLE_COLORS } from '../roles'

interface Props {
  selectedRoleId: string
  onSelect: (roleId: string) => void
  onClose: () => void
}

export default function RoleSelector({ selectedRoleId, onSelect, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 overflow-hidden"
        style={{ background: 'var(--bg-card)', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-lt)' }}>
          <span className="font-semibold text-base" style={{ color: 'var(--text)' }}>选择角色</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition"
            style={{ color: 'var(--text-ter)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-lt)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-ter)' }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-3 max-h-[60vh] overflow-y-auto">
          {ROLES.map((role) => {
            const isActive = selectedRoleId === role.id
            const Icon = ROLE_ICONS[role.id]
            const color = ROLE_COLORS[role.id]
            return (
              <button
                key={role.id}
                onClick={() => { onSelect(role.id); onClose() }}
                className="w-full text-left px-4 py-3.5 rounded-xl transition flex items-center gap-3.5 mb-1"
                style={{
                  background: isActive ? `${color}10` : 'transparent',
                  border: isActive ? `1.5px solid ${color}30` : '1.5px solid transparent',
                  color: 'var(--text)',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--border-lt)' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}12`, color }}
                >
                  {Icon && <Icon size={20} strokeWidth={1.5} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{role.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-sec)' }}>{role.description}</div>
                </div>
                {isActive && (
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: color }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
