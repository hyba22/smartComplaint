import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router';

import { faBan, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { deleteUser, getUser } from './user-management.reducer';

export const UserManagementDeleteDialog = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  const { login } = useParams<'login'>();

  useEffect(() => {
    if (login) {
      dispatch(getUser(login));
    }
  }, [dispatch, login]);

  const handleClose = () => {
    navigate('/admin/user-management');
  };

  const user = useAppSelector(state => state.userManagement.user);

  const confirmDelete = () => {
    dispatch(deleteUser(user.login));
    handleClose();
  };

  return (
    <Modal show onHide={handleClose}>
      <ModalHeader data-cy="userManagementDeleteDialogHeading" closeButton>
        {t('users.delete')}
      </ModalHeader>
      <ModalBody>{t('users.deleteConfirm', { login: user.login })}</ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon={faBan} />
          &nbsp; {t('common.cancel')}
        </Button>
        <Button variant="danger" onClick={confirmDelete} data-cy="entityConfirmDeleteButton">
          <FontAwesomeIcon icon={faTrash} />
          &nbsp; {t('common.delete')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UserManagementDeleteDialog;
