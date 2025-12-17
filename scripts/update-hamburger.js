const fs = require('fs');
const path = 'src/app/[stationId]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove password change button and add notifications button
const oldMenu = `<button
                      style={styles.menuItem}
                      onClick={() => { setShowChangePasswordModal(true); setShowManagerMenu(false) }}
                    >
                      🔑 שינוי סיסמה
                    </button>

                    {/* Divider */}
                    <div style={styles.menuDivider} />

                    <button
                      style={{ ...styles.menuItem, color: '#ef4444' }}
                      onClick={() => { handleLogout(); setShowManagerMenu(false) }}
                    >
                      🚪 יציאה
                    </button>`;

const newMenu = `{/* Push Notifications toggle */}
                    {pushSupported && (
                      <button
                        style={{
                          ...styles.menuItem,
                          color: pushEnabled ? '#ef4444' : '#22c55e'
                        }}
                        onClick={() => { handleTogglePush(); setShowManagerMenu(false) }}
                        disabled={enablingPush}
                      >
                        {enablingPush ? '⏳ מעדכן...' : pushEnabled ? '🔕 כבה התראות' : '🔔 הפעל התראות'}
                      </button>
                    )}

                    {/* Divider */}
                    <div style={styles.menuDivider} />

                    <button
                      style={{ ...styles.menuItem, color: '#ef4444' }}
                      onClick={() => { handleLogout(); setShowManagerMenu(false) }}
                    >
                      🚪 יציאה
                    </button>`;

if (content.includes(oldMenu)) {
  content = content.replace(oldMenu, newMenu);
  fs.writeFileSync(path, content, 'utf8');
  console.log('SUCCESS - Updated hamburger menu');
} else {
  console.log('ERROR - Could not find menu to replace');
}
