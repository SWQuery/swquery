import { motion } from 'framer-motion';
import { CardItem } from '@/components/Atoms/SectionItem';

interface SectionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
    items?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Icon: any;
        iconColor: string;
        title: string;
        description: string;
        className?: string;
    }[];
    columns?: number;
    textAlign?: string;
}

export const Section: React.FC<SectionProps> = ({
    title,
    items = [],
    columns = 3,
    textAlign = 'center',
}) => {

    const columnsClass = columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

    const textAlignClass = textAlign === 'left' ? 'text-left' : 'text-center';

    return (
        <section className={`container mx-auto px-6 py-16 ${textAlignClass}`}>
            <motion.h3
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#14F195] to-[#00D1FF]`}
            >
                {title}
            </motion.h3>
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ staggerChildren: 0.2 }}
                className={`grid ${columnsClass} gap-8`}
            >
                {items.map((item, index) => (
                    <CardItem
                        key={index}
                        Icon={item.Icon}
                        iconColor={item.iconColor}
                        title={item.title}
                        description={item.description}
                        align={textAlign}
                        className={item.className}
                    />
                ))}
            </motion.div>
        </section>
    );
};