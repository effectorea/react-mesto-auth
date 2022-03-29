import React, { useState, useEffect } from "react";
import { api } from "../utils/Api";
import Footer from "./Footer";
import Header from "./Header";
import ImagePopup from "./ImagePopup";
import Main from "./Main";
import { CurrentUserContext } from "../context/CurrentUserContext";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import PopupWithConfirm from "./PopupWithConfirm";
import { Route } from "react-router-dom";
import { Switch, useHistory } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./Register";
import Login from "./Login";

function App() {
  const history = useHistory();
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [deletedCard, setDeletedCard] = useState(null);
  const [cards, setCards] = useState([]);
  const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    api
      .getCards()
      .then((res) => {
        setCards(res);
      })
      
  }, []);

  useEffect(() => {
    api
      .getUserInfo()
      .then((res) => {
        setCurrentUser(res);
      })
      .catch((err) => {
        console.log(`Ошибка при загрузке данных пользователя ${err}`);
      });
  }, []);

  const handleEditAvatarClick = () => {
    setIsEditAvatarPopupOpen(true);
  };
  const handleEditProfileClick = () => {
    setIsEditProfilePopupOpen(true);
  };
  const handleAddPlaceClick = () => {
    setIsAddPlacePopupOpen(true);
  };
  const handleCardClick = (card) => {
    setSelectedCard(card);
  };
  const closeAllPopups = () => {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard(null);
    setIsConfirmationPopupOpen(false);
  };

  const handleUpdateUser = (info) => {
    api
      .setInfo(info)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(`Ошибка при загрузке данных пользователя ${err}`);
      });
  };

  const handleUpdateAvatar = (info) => {
    api
      .setUserAvatar(info)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(`Ошибка при загрузке аватара ${err}`);
      });
  };

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);

    api
      .switchLike(card._id, isLiked)
      .then((res) =>
        setCards((state) => state.map((c) => (c._id === card._id ? res : c)))
      )
      .catch((err) => console.log(err));
  }

  function handleCardDelete() {
    api
      .deleteCard(deletedCard._id)
      .then(() =>
        setCards((state) => state.filter((c) => c._id !== deletedCard._id))
      )
      .then(() => closeAllPopups())
      .catch((err) => console.log(err));
  }

  function handleConfirmationClick(data) {
    setDeletedCard(data);
    setIsConfirmationPopupOpen(true);
  }

  function handleUpdatePlace(card) {
    api
      .addCard(card)
      .then((res) => {
        setCards([res, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(`Ошибка при загрузке карточки ${err}`);
      });
  }
  function handleRegistration() {}

  function handleLoggingIn() {}

  function handleExit() {}

  return (
    <div className="App">
      <CurrentUserContext.Provider value={currentUser}>
        <div className="page">
          <Header email={email} onExit={handleExit} />
          <Switch>
            <ProtectedRoute
              exact path="/"
              component={Main}
              loggedIn={loggedIn}
              cards={cards}
              onEditProfile={handleEditProfileClick}
              onAddPlace={handleAddPlaceClick}
              onEditAvatar={handleEditAvatarClick}
              onCardClick={handleCardClick}
              onCardLike={handleCardLike}
              onCardDelete={handleConfirmationClick}
            />
            <Route path="/sign-up">
              <Register onRegister={handleRegistration} />
            </Route>
            <Route path="/sign-in">
              <Login onLogin={handleLoggingIn}/>
            </Route>
          </Switch>
          <Footer />
          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
          />

          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
          />

          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onUpdatePlace={handleUpdatePlace}
          />

          <PopupWithConfirm
            isOpen={isConfirmationPopupOpen}
            onClose={closeAllPopups}
            handleConfirmation={handleCardDelete}
          />

          <ImagePopup card={selectedCard} onClose={closeAllPopups} />
        </div>
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;
