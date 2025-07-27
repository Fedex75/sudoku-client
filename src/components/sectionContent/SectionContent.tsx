import { PropsWithChildren } from 'react';
import './sectionContent.css';

type Props = {
    id?: string;
};

export default function SectionContent({ children, id }: PropsWithChildren<Props>) {
    return (
        <div className='section__content' id={id}>
            {children}
        </div>
    );
}
