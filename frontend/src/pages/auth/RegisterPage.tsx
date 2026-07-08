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

function RegisterPage() {
    const navigate = useNavigate()
    const { register } = useAuth()

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        phonenumber: '',
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
            await register(formData)
            navigate('/')
        } catch (err) {
            console.error(err)
            setError('Registrierung fehlgeschlagen. Bitte pruefe deine Eingaben.')
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
                            <CCardTitle className="mb-4">Konto erstellen</CCardTitle>

                            {error && <CAlert color="danger">{error}</CAlert>}

                            <CForm onSubmit={handleSubmit}>
                                <CFormInput
                                    className="mb-3"
                                    name="firstname"
                                    placeholder="Vorname"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    required
                                />

                                <CFormInput
                                    className="mb-3"
                                    name="lastname"
                                    placeholder="Nachname"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    required
                                />

                                <CFormInput
                                    className="mb-3"
                                    name="phonenumber"
                                    placeholder="Telefonnummer"
                                    value={formData.phonenumber}
                                    onChange={handleChange}
                                    required
                                />

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
                                    {loading ? 'Registrierung laeuft...' : 'Registrieren'}
                                </CButton>
                            </CForm>

                            <div className="mt-3 text-center">
                                Bereits registriert? <Link to="/login">Zum Login</Link>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </CContainer>
    )
}

export default RegisterPage