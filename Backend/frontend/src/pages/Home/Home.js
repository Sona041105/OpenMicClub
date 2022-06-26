import React from 'react';
import styles from './Home.module.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/shared/Card/Card';
import Button from '../../components/shared/Button/Button';




const Home = () => {
    const signInLinkStyle = {
        color: '#0077ff',
        fontWeight: 'bold',
        textDecoration: 'none',
        marginLeft: '10px',
    };
    const navigate = useNavigate();
    
    function startRegister() {
        navigate('/authenticate');
    }
    return (
        <div className={styles.cardWrapper}>
            <Card title="Welcome to OpenMicClub!" icon="Hand1">
                <p className={styles.text}>
                OpenMicClub is a place to listen in on fascinating conversations, talk with the world's most amazing people, 
                and make new friends from all walks of life:)
                </p>
                <div>
                    <Button onClick={startRegister} text="Let's Go" />
                </div>
                <div className={styles.signinWrapper}>
                    <span className={styles.hasInvite}>
                        Have an invite text?
                    </span>
                </div>
            </Card>
        </div>
    );
};

export default Home;
