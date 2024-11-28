import { MotiView } from "moti";

const SkeletonPlaceholder = ({ width, height, borderRadius }) => {
    return (
      <MotiView
      from={{ backgroundColor: '#aaaaaa'}} 
      animate={{ backgroundColor: '#444444'}} 
        transition={{
          type: 'timing',
          duration: 500,
          loop: true,
        }}
        style={{
          width,
          height,
          borderRadius,
        }}
      />
    );
  };

  export default SkeletonPlaceholder