import { motion } from 'framer-motion'
import { useFormStatus } from 'react-dom'
import { LoaderCircle } from 'lucide-react'
const FormButton = ({ border }: { border: any }) => {
    const { pending } = useFormStatus()
    return (
        <motion.button
            disabled={pending}
            type="submit"
            style={{
                border,
            }}
            whileHover={{
                scale: 1.015,
            }}
            whileTap={{
                scale: 0.985,
            }}
            className="mt-6 px-4 py-2 rounded-full text-zinc-300 font-bold tracking-wider bg-transparent "
        >
            {pending ?
                <LoaderCircle size={20} className='text-sky-500 animate-spin' />
                : "Send 0.20 AGNG"}
        </motion.button>
    )
}

export default FormButton