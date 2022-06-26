import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoom } from '../../http';

import styles from './Room.module.css';

const Room = () => {
    const user = useSelector((state) => state.auth.user);
    const { id: roomId } = useParams();
    const [room, setRoom] = useState(null);

    const { clients, provideRef,handleMute } = useWebRTC(
        roomId,
        user
    );


    
    const uniq = (clients)=> {
        var seen = {};
        return clients.filter(function(item) {
            return seen.hasOwnProperty(item.id) ? false : (seen[item.id] = true);
        });
    };
     
    const Clients = uniq(clients);

    

//     const dummyclients =[{
//         id:1,
//         name:'ravi',
//     },
//     {
//         id:2,
//         name:'raju',
//     },
// ];


    const history = useNavigate();

    const [isMuted, setMuted] = useState(true);

    useEffect(() => {
        const fetchRoom = async () => {
            const { data } = await getRoom(roomId);
            setRoom((prev) => data);
        };

        fetchRoom();
    }, [roomId]);

    useEffect(() => {
        handleMute(isMuted, user.id);
    }, [isMuted]);

    const handManualLeave = () => {
        history('/rooms');
    };

    const handleMuteClick = (clientId) => {
        if (clientId !== user.id) return;
        setMuted((prev) => !prev);
    };

    return (
        <div>
            <div className="container">
                <button onClick={handManualLeave} className={styles.goBack}>
                    <img src="/images/arrow2.png" alt="arrow-left" />
                    <span>All voice rooms</span>
                </button>
            </div>
            <div className={styles.clientsWrap}>
                <div className={styles.header}>
                    {room && <h2 className={styles.topic}>{room.topic}</h2>}
                    <div className={styles.actions}>
                        <button className={styles.actionBtn}>
                            <img src="/images/palm.png" alt="palm-icon" />
                        </button>
                        <button
                            onClick={handManualLeave}
                            className={styles.actionBtn}
                        >
                            <img src="/images/vic.png" alt="win-icon" />
                            <span>Leave quietly</span>
                        </button>
                    </div>
                </div>
                <div className={styles.clientsList}>
                    {Clients.map((client) => {
                        return (
                            <div className={styles.client} key={client.id}>
                                <div className={styles.userHead}>
                                    <img
                                        className={styles.userAvatar}
                                        src={client.avatar}
                                        alt=""
                                    />
                                    <audio
                                        autoPlay
                                        playsInline
                                        ref={(instance) => {
                                            provideRef(instance, client.id);
                                        }}
                                    />
                                    <button
                                        onClick={() =>
                                            handleMuteClick(client.id)
                                        }
                                        className={styles.micBtn}
                                    >
                                        {client.muted ? (
                                            <img
                                                className={styles.mic}
                                                src="/images/mic-mute.png"
                                                alt="mic"
                                            />
                                        ) : (
                                            <img
                                                className={styles.mic}
                                                src="/images/mic.png"
                                                alt="mic"
                                            />
                                        )}
                                    </button>
                                </div>
                                <h4>{client.name}</h4>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Room;