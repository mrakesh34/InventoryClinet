import React, { useContext, useState } from 'react'
import { Button, Modal } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';

const Logout = () => {
    const [openModal, setOpenModal] = useState("");
    const props = { openModal, setOpenModal };
    const navigate = useNavigate();

    const { logOut } = useContext(AuthContext);

    const handleSignOut = () => {
        logOut();
        navigate('/');
    }

    return (
        <div className='h-screen flex items-center justify-center'>
            <Button onClick={() => props.setOpenModal('default')}>Click here to Logout</Button>
            <Modal show={props.openModal === 'default'} onClose={() => props.setOpenModal(undefined)}>
                <Modal.Header>Sign Out</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Are you sure you want to sign out? You will need to log in again to access the dashboard.
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleSignOut}>Yes, Sign me out</Button>
                    <Button color="gray" onClick={() => props.setOpenModal(undefined)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Logout