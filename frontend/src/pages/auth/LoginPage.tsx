import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    CAlert,
    CButton,
    CCard,
    CCardBody,
    CCardTitle,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CRow,
} from '@coreui/react'
import { useAuth } from '../../auth/AuthContext'

function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            await login(formData)
            navigate('/')
        } catch (err) {
            console.error(err)
            setError('Login fehlgeschlagen. Bitte pruefe E-Mail und Passwort.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <CContainer className="py-5">
            <CRow className="justify-content-center">
                <CCol md={8} lg={6}>
                    <CCard>
                        <CCardBody>
                            <CCardTitle className="mb-4">Anmelden</CCardTitle>

                            {error && <CAlert color="danger">{error}</CAlert>}

                            <CForm onSubmit={handleSubmit}>
                                <CFormInput
                                    className="mb-3"
                                    name="email"
                                    type="email"
                                    placeholder="E-Mail"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                                <CFormInput
                                    className="mb-4"
                                    name="password"
                                    type="password"
                                    placeholder="Passwort"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <CButton type="submit" color="dark" className="w-100" disabled={loading}>
                                    {loading ? 'Anmeldung laeuft...' : 'Anmelden'}
                                </CButton>
                            </CForm>

                            <div className="mt-3 text-center">
                                Noch kein Konto? <Link to="/register">Jetzt registrieren</Link>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </CContainer>
    )
}

export default LoginPage