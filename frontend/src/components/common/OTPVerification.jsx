import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'

// Reusable OTP verification component
function OTPVerification({ onVerify, onResend }) {
    const [seconds, setSeconds] = useState(60)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm()

    const otpRefs = useRef([])

    // Handle OTP countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(prev => prev > 0 ? prev - 1 : 0)
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    // Combine OTP digits and submit
    const onSubmit = (data) => {
        const otp = Object.values(data).join('')
        onVerify(otp)
    }

    // Handle OTP resend
    const resendOTP = () => {
        onResend()
        setSeconds(60)
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>Enter OTP</label>

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

                <button type="submit">VERIFY OTP</button>
            </form>

            <p>
                Didn't receive OTP?{' '}
                <button
                    type="button"
                    disabled={seconds > 0}
                    onClick={resendOTP}
                >
                    Resend OTP
                </button>
            </p>

            <p>
                {seconds > 0 && `Resend available in ${seconds} seconds`}
            </p>
        </div>
    )
}

export default OTPVerification