import { motion } from 'framer-motion'
import { useFormStatus } from 'react-dom'
const FormInput = ({
    border,
    boxShadow,
}: { border: any, boxShadow: any }

) => {
    const { pending } = useFormStatus()
    return (
        <motion.input
            style={{
                border,
                boxShadow,
            }}
            disabled={pending}
            whileHover={{
                scale: 1.015,
            }}
            type="text"
            name="address"
            placeholder="Enter your address"
            className="group relative flex w-96 mt-12 items-center gap-1.5 rounded-full bg-gray-950/10 px-4 py-2 text-gray-50 transition-colors hover:bg-gray-950/50"
        />
    )
}

export default FormInput