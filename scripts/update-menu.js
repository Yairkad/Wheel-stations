const fs = require('fs');
const path = 'src/app/[stationId]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add return and view form options, update edit/delete
const oldMenu = `{/* WhatsApp share - only for available wheels */}
                          {wheel.is_available && !wheel.temporarily_unavailable && (
                            <button
                              style={styles.optionItem}
                              onClick={() => {
                                openWhatsAppModal(wheel)
                                setOpenOptionsMenu(null)
                              }}
                            >
                              💬 שלח קישור בוואטסאפ
                            </button>
                          )}

                          {/* Manual borrow - only for available wheels */}
                          {wheel.is_available && !wheel.temporarily_unavailable && (
                            <button
                              style={styles.optionItem}
                              onClick={() => {
                                setManualBorrowWheel(wheel)
                                setShowManualBorrowModal(true)
                                setOpenOptionsMenu(null)
                              }}
                            >
                              ✍️ הזן השאלה ידנית
                            </button>
                          )}

                          {/* Mark unavailable - only for available wheels */}
                          {wheel.is_available && !wheel.temporarily_unavailable && (
                            <button
                              style={styles.optionItem}
                              onClick={() => {
                                setSelectedWheelForUnavailable(wheel)
                                setShowUnavailableModal(true)
                                setOpenOptionsMenu(null)
                              }}
                            >
                              ⚠️ סמן כלא זמין
                            </button>
                          )}

                          {/* Edit wheel */}
                          <button
                            style={styles.optionItem}
                            onClick={() => {
                              setSelectedWheel(wheel)
                              setWheelForm({
                                wheel_number: wheel.wheel_number,
                                rim_size: wheel.rim_size,
                                bolt_count: String(wheel.bolt_count),
                                bolt_spacing: String(wheel.bolt_spacing),
                                category: wheel.category || '',
                                is_donut: wheel.is_donut,
                                notes: wheel.notes || ''
                              })
                              setShowEditWheelModal(true)
                              setOpenOptionsMenu(null)
                            }}
                          >
                            ✏️ ערוך גלגל
                          </button>

                          {/* Delete wheel */}
                          <button
                            style={{ ...styles.optionItem, color: '#ef4444' }}
                            onClick={() => {
                              handleDeleteWheel(wheel)
                              setOpenOptionsMenu(null)
                            }}
                          >
                            🗑️ מחק גלגל
                          </button>`;

const newMenu = `{/* Return wheel - only for borrowed wheels */}
                          {!wheel.is_available && !wheel.temporarily_unavailable && (
                            <button
                              style={styles.optionItem}
                              onClick={() => {
                                handleReturn(wheel)
                                setOpenOptionsMenu(null)
                              }}
                            >
                              📥 החזר גלגל
                            </button>
                          )}

                          {/* View form - only for borrowed wheels with form */}
                          {!wheel.is_available && wheel.current_borrow?.form_id && (
                            <a
                              href={\`/forms/\${wheel.current_borrow.form_id}\`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{...styles.optionItem, textDecoration: 'none', display: 'block'}}
                              onClick={() => setOpenOptionsMenu(null)}
                            >
                              📄 צפייה בטופס
                            </a>
                          )}

                          {/* WhatsApp share - only for available wheels */}
                          {wheel.is_available && !wheel.temporarily_unavailable && (
                            <button
                              style={styles.optionItem}
                              onClick={() => {
                                openWhatsAppModal(wheel)
                                setOpenOptionsMenu(null)
                              }}
                            >
                              💬 שלח קישור בוואטסאפ
                            </button>
                          )}

                          {/* Manual borrow - only for available wheels */}
                          {wheel.is_available && !wheel.temporarily_unavailable && (
                            <button
                              style={styles.optionItem}
                              onClick={() => {
                                setManualBorrowWheel(wheel)
                                setShowManualBorrowModal(true)
                                setOpenOptionsMenu(null)
                              }}
                            >
                              ✍️ הזן השאלה ידנית
                            </button>
                          )}

                          {/* Mark unavailable - only for available wheels */}
                          {wheel.is_available && !wheel.temporarily_unavailable && (
                            <button
                              style={styles.optionItem}
                              onClick={() => {
                                setSelectedWheelForUnavailable(wheel)
                                setShowUnavailableModal(true)
                                setOpenOptionsMenu(null)
                              }}
                            >
                              ⚠️ סמן כלא זמין
                            </button>
                          )}

                          {/* Edit wheel - disabled for borrowed wheels */}
                          <button
                            style={{
                              ...styles.optionItem,
                              ...(!wheel.is_available && !wheel.temporarily_unavailable ? styles.optionItemDisabled : {})
                            }}
                            disabled={!wheel.is_available && !wheel.temporarily_unavailable}
                            onClick={() => {
                              if (!wheel.is_available && !wheel.temporarily_unavailable) return
                              setSelectedWheel(wheel)
                              setWheelForm({
                                wheel_number: wheel.wheel_number,
                                rim_size: wheel.rim_size,
                                bolt_count: String(wheel.bolt_count),
                                bolt_spacing: String(wheel.bolt_spacing),
                                category: wheel.category || '',
                                is_donut: wheel.is_donut,
                                notes: wheel.notes || ''
                              })
                              setShowEditWheelModal(true)
                              setOpenOptionsMenu(null)
                            }}
                          >
                            ✏️ ערוך גלגל {!wheel.is_available && !wheel.temporarily_unavailable && '(מושאל)'}
                          </button>

                          {/* Delete wheel - disabled for borrowed wheels */}
                          <button
                            style={{
                              ...styles.optionItem,
                              color: wheel.is_available || wheel.temporarily_unavailable ? '#ef4444' : '#9ca3af',
                              ...(!wheel.is_available && !wheel.temporarily_unavailable ? styles.optionItemDisabled : {})
                            }}
                            disabled={!wheel.is_available && !wheel.temporarily_unavailable}
                            onClick={() => {
                              if (!wheel.is_available && !wheel.temporarily_unavailable) return
                              handleDeleteWheel(wheel)
                              setOpenOptionsMenu(null)
                            }}
                          >
                            🗑️ מחק גלגל {!wheel.is_available && !wheel.temporarily_unavailable && '(מושאל)'}
                          </button>`;

if (content.includes(oldMenu)) {
  content = content.replace(oldMenu, newMenu);
  fs.writeFileSync(path, content, 'utf8');
  console.log('SUCCESS - Updated options menu');
} else {
  console.log('ERROR - Could not find menu to replace');
}
