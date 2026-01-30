import Cookies from 'js-cookie'

export function getTokenName() {
  return Cookies.get('tokenName')
}
export function getTokenValue() {
  return Cookies.get('tokenValue')
}
export function setTokenName(name) {
  return Cookies.set('tokenName',name)
}

export function setTokenValue(value) {
  return Cookies.set('tokenValue', value)
}

export function removeToken() {
  return Cookies.remove('tokenValue')
}
