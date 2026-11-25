import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'

//-------------------------------------------------------------------------
// Receives verification status and backend error from the parent page

function OTPVerification({ onVerify, onResend, isLoading, serverError }) {
    // Calculates remaining seconds based on stored expiry timestamp in sessionStorage
    const [seconds, setSeconds] = useState(() => {
        const storedExpiry = sessionStorage.getItem('yumera_otp_expiry')
        if (storedExpiry) {
            const remaining = Math.max(0, Math.ceil((parseInt(storedExpiry, 10) - Date.now()) / 1000))
            if (remaining > 0) {
                return remaining
            }
        }
        // If expired or fresh visit, start fresh 60s
        const newExpiry = Date.now() + 60 * 1000
        sessionStorage.setItem('yumera_otp_expiry', newExpiry.toString())
        return 60
    })

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm()

    const otpRefs = useRef([])

    // Countdown interval recalculating from stored expiry
    useEffect(() => {
        const timer = setInterval(() => {
            const storedExpiry = sessionStorage.getItem('yumera_otp_expiry')
            if (storedExpiry) {
                const remaining = Math.max(0, Math.ceil((parseInt(storedExpiry, 10) - Date.now()) / 1000))
                setSeconds(remaining)
                if (remaining <= 0) {
                    clearInterval(timer)
                }
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    // Combine OTP digits and submit
    const onSubmit = (data) => {
        const otp = Object.values(data).join('')
        onVerify(otp)
    }

    // Resets the countdown and updates stored expiry only when OTP resend succeeds
    const resendOTP = async () => {
        const success = await onResend()

        if (success) {
            const newExpiry = Date.now() + 60 * 1000
            sessionStorage.setItem('yumera_otp_expiry', newExpiry.toString())
            setSeconds(60)
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label style={{ textAlign: 'center', display: 'block' }}>Enter OTP</label>

                <div className="otp-inputs">
                    {[1, 2, 3, 4, 5, 6].map((number) => {
                        const field = register(`otp${number}`, {
                            required: 'Enter all 6 digits',
                            pattern: /^[0-9]$/
                        })

                        return (
                            <input
                                key={number}
                                type="text"
                                maxLength={1}
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                {...field}
                                ref={(element) => {
                                    field.ref(element)
                                    otpRefs.current[number - 1] = element
                                }}
                                onChange={(event) => {
                                    field.onChange(event)

                                    if (event.target.value && number < 6) {
                                        otpRefs.current[number].focus()
                                    }
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Backspace' && !event.target.value && number > 1) {
                                        otpRefs.current[number - 2]?.focus()
                                    }
                                }}
                            />
                        )
                    })}
                </div>

                {/* OTP validation error */}
                {Object.keys(errors).length > 0 && (
                    <p className="error-message">
                        Please enter all 6 OTP digits correctly.
                    </p>
                )}

                {/* Displays backend verification or resend errors */}
                {serverError && (
                    <p className="error-message">{serverError}</p>
                )}

                {/* Disables verification while the backend request is processing */}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'VERIFYING...' : 'VERIFY OTP →'}
                </button>
            </form>

            <div className="otp-resend-wrapper">
                {seconds > 0 ? (
                    <p className="otp-timer">
                        Resend OTP in <span>{seconds}s</span>
                    </p>
                ) : (
                    <p className="otp-resend-text">
                        Didn't receive the OTP?{' '}
                        <button
                            type="button"
                            className="resend-link-btn"
                            onClick={resendOTP}
                        >
                            Resend OTP
                        </button>
                    </p>
                )}
            </div>
        </div>
    )
}

export default OTPVerification