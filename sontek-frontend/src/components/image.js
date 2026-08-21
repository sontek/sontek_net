import NextImage from "next/image";

export default function Image(props) {
    return (
        <NextImage
            {...props}
            unoptimized
        />
    );
}
