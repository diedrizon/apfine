import "../styles/Notificaciones.css";
import { FiX } from "react-icons/fi";

const NotificationsModal = ({ isOpen, onClose, notifications }) => {
    if (!isOpen) return null;

    return (
        <div className="notifications-modal-overlay">
            <div className="notifications-modal">
                <div className="notifications-header">
                    <h2>Notificaciones</h2>
                    <button className="close-button" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>
                <div className="notifications-body">
                    {notifications && notifications.length > 0 ? (
                        <ul className="notifications-list">
                            {notifications.map((n, i) => (
                                <li key={i} className="notification-item">
                                    <div className="notification-content">
                                        <p className="notification-title">{n.title}</p>
                                        <p className="notification-message">{n.message}</p>
                                    </div>
                                    <span className="notification-time">{n.time}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-notifications">No hay notificaciones</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsModal;
