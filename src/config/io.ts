import { SignJWT, jwtVerify } from 'jose';

interface signUpProps {
  name: string,
  email: string,
  location: {
    country: string,
    city: string
  },
  locale: 'en-US' | 'uk-UA',
  password: string
}
interface signInProps {
  email: string,
  token: string
}
export interface createRequestProps {
  userId: string,
  type: 'order' | 'delivery',
  parcel?: string,
  route: {
    from: string,
    to: string
  },
  description?: string,
  date?: string
}
interface changeRequestProps {
  userId: string,
  requestId: string,
  status?: string,
  description?: string
}

// .env doesn't work here for some reason
export const JWT_SECRET = "superSecretKey"

export async function signJWT(raw_payload: string, secret: string, expiresIn: string = '7d') {
  const secretEncoded = new TextEncoder().encode(secret);
  const alg = 'HS256';

  const payload = {
    payload: raw_payload
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretEncoded);
}

export async function verifyJWT(token: string, secret: string) {
  const secretEncoded = new TextEncoder().encode(secret);

  try {
    const { payload } = await jwtVerify(token, secretEncoded);
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw error;
  }
}


export async function signUp(props: signUpProps) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Access-Control-Allow-Origin", "*");
  props.password = await signJWT(props.password, JWT_SECRET)
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(props),
    headers: myHeaders
  }
  const res = await fetch('http://localhost:5000/api/signup', options)
  if (res.status === 200) return res.json()
  else return 'error'
}

export async function signIn(props: signInProps) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "text/plain");
  myHeaders.append("Access-Control-Allow-Origin", "*");
  props.token = await signJWT(props.token, JWT_SECRET);
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(props),
    headers: myHeaders
  }
  const res = await fetch('http://localhost:5000/api/signin', options)
  if (res.status === 200) return res.text()
  else return res
}

export async function createRequest(props: createRequestProps) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "text/plain");
  myHeaders.append("Access-Control-Allow-Origin", "*");
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(props),
    headers: myHeaders
  }

  const res = await fetch('http://localhost:5000/api/requests/create', options)
  if (res.status === 200) return res.text()
  else return res
}

export async function changeRequest(props: changeRequestProps) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "text/plain");
  myHeaders.append("Access-Control-Allow-Origin", "*");
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(props),
    headers: myHeaders
  }

  const res = await fetch(`http://localhost:5000/api/requests/${props.requestId}`, options)
  console.log(res)
  if (res.status === 200) return res.text()
  else return res
}

export async function cancelRequest(requestId: string) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "text/plain");
  myHeaders.append("Access-Control-Allow-Origin", "*");
  const options: RequestInit = {
    method: 'PUT',
    headers: myHeaders
  }

  const res = await fetch(`http://localhost:5000/api/requests/${requestId}/cancel`, options)
  if (res.status === 200) return res.text()
  else return res

}

export async function completeRequest(requestId: string) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "text/plain");
  myHeaders.append("Access-Control-Allow-Origin", "*");
  const options: RequestInit = {
    method: 'PUT',
    headers: myHeaders
  }

  const res = await fetch(`http://localhost:5000/api/requests/${requestId}/received`, options)
  if (res.status === 200) return res.text()
  else return res

}

export async function getRequests(userId: string) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Access-Control-Allow-Origin", "*");
  const options: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify({ userId: userId })
  }
  const res = await fetch('http://localhost:5000/api/requests', options)
  if (res.status === 200) return res.json()
  else return res
}
