var all = {
	'title': {
		en: 'Crititot - Criticize everything, constructively!',
		ca: 'Crititot - Critica-ho tot, constructivament!'
	},
	'bar-mainpage': {
		en: 'Crititot',
		ca: 'Crititot'
	},
	'bar-loginregister': {
		en: 'Log in/Register',
		ca: 'Registre/Entrada'
	},
	'bar-login': {
		en: 'Log in',
		ca: 'Entrada'
	},
	'bar-register': {
		en: 'Register',
		ca: 'Registre'
	},
	'bar-username': {
		en: 'Username',
		ca: 'Nom d\'usuari'
	},
	'bar-password': {
		en: 'Password',
		ca: 'Contrasenya'
	},
	'bar-fullname': {
		en: 'Full name (ie: Richard Stallman)',
		ca: 'Nom sencer (pe: Richard Stallman)'
	},
	'bar-description': {
		en: 'Describe yourself.',
		ca: 'Descriu-te.'
	},
	'bar-recommendation': {
		en: 'Publish a recommendation',
		ca: 'Publica una recomanació'
	},
	'bar-book': {
		en: 'Book',
		ca: 'Llibre'
	},
	'bar-film': {
		en: 'Film',
		ca: 'Pel·lícula'
	},
	'bar-title': {
		en: 'Title',
		ca: 'Títol'
	},
	'bar-directorauthor': {
		en: 'Director/Author',
		ca: 'Director(a)/Autor(a)'
	},
	'bar-cancel': {
		en: 'Cancel',
		ca: 'Cancel·la'
	},
	'bar-publish': {
		en: 'Publish',
		ca: 'Publica'
	},
	'bar-inbox': {
		en: 'Inbox',
		ca: 'Safata d\'entrada'
	},
	'bar-logout': {
		en: 'Log out',
		ca: 'Surt de la sessió'
	},
	'bar-configuration': {
		en: 'Configuration',
		ca: 'Configuració'
	},
	'bar-yourprofile': {
		en: 'Your profile',
		ca: 'El teu perfil'
	},
	'error-1': {
		en: "Username or password are wrong.",
		ca: "El nom d'usuari o la contrasenya són incorrectes."
	},
	'error-2': {
		en: "This username already exists.",
		ca: "Aquest nom d'usuari ja existeix."
	},
	'error-3': {
		en: "This page is only visible to already registered users (ie, inbox).",
		ca: "Aquesta pàgina és només visible per a usuaris registrats (per exemple, safata d'entrada)."
	},
	'error-4': {
		en: "This user doesn't exist.",
		ca: "Aquest usuari no existeix."
	},
	'error-code': {
		en: 'Error code',
		ca: 'Codi d\'error'
	},
	'box-by': {
		en: 'by',
		ca: 'de'
	},
	'box-when': {
		en: 'in',
		ca: 'el'
	},
	'box-more': {
		en: 'More',
		ca: 'Més'
	},
	'box-hasrecommended': {
		en: 'has recommended',
		ca: 'ha recomanat'
	},
	'box-noresults': {
		en: 'No results found',
		ca: "No s'han trobat resultats."
	},
	'profile-follow': {
		en: 'Follow',
		ca: "Segueix"
	},
	'profile-unfollow': {
		en: 'Unfollow',
		ca: "Deixa de seguir"
	},
	'profile-followers': {
		en: 'Followed by',
		ca: "Seguit per"
	},
	'profile-following': {
		en: 'Following',
		ca: "Seguint-ne"
	},
	'config-language': {
		en: 'Language',
		ca: "Idioma"
	},
	'config-submit': {
		en: 'Submit',
		ca: "Canvia"
	}
};

exports.msg = function (lang, id) {
	return all[id][lang];
}
