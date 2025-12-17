const fs = require('fs');
const path = 'src/app/[stationId]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove notifications section from station settings modal
const oldSection = `{/* Section: Push Notifications */}
            <div style={{marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px'}}>
              <h4 style={{margin: '0 0 12px', color: '#f59e0b', fontSize: '1rem'}}>🔔 התראות</h4>
              <p style={{fontSize: '0.85rem', color: '#a0aec0', margin: '0 0 12px'}}>
                קבל התראה קופצת בכל בקשת השאלה חדשה
              </p>
              {pushSupported ? (
                <button
                  style={{
                    ...styles.smallBtn,
                    background: pushEnabled ? '#ef4444' : '#22c55e',
                    width: '100%'
                  }}
                  onClick={handleTogglePush}
                  disabled={enablingPush}
                >
                  {enablingPush ? 'מעדכן...' : pushEnabled ? '🔕 כבה התראות' : '🔔 הפעל התראות'}
                </button>
              ) : (
                <p style={{fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic'}}>
                  {getPushNotSupportedReason() || 'התראות לא נתמכות בדפדפן זה'}
                </p>
              )}
            </div>

            <button style={{...styles.cancelBtn, width: '100%'}} onClick={() => setShowEditDetailsModal(false)}>סגור</button>`;

const newSection = `<button style={{...styles.cancelBtn, width: '100%'}} onClick={() => setShowEditDetailsModal(false)}>סגור</button>`;

if (content.includes(oldSection)) {
  content = content.replace(oldSection, newSection);
  fs.writeFileSync(path, content, 'utf8');
  console.log('SUCCESS - Removed notifications from settings');
} else {
  console.log('ERROR - Could not find section to remove');
}
