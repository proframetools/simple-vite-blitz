// Frame Asset Manager for handling dynamic frame asset loading

export interface FrameAssetConfig {
  colorName: string;
  materialType: string;
  thickness: string;
  aspectRatio: string;
}

export interface PhotoDimensions {
  width: number;
  height: number;
}

export interface PhotoOrientation {
  type: 'landscape' | 'portrait' | 'square';
  needsRotation: boolean;
  aspectRatio: number;
}

export class FrameAssetManager {
  private static assetCache = new Map<string, HTMLImageElement>();
  private static baseAssetPath = '/src/assets/frames/';

  /**
   * Detect photo orientation and aspect ratio
   */
  static detectPhotoOrientation(dimensions: PhotoDimensions): PhotoOrientation {
    const { width, height } = dimensions;
    const aspectRatio = width / height;

    if (aspectRatio === 1) {
      return {
        type: 'square',
        needsRotation: false,
        aspectRatio: 1.0
      };
    } else if (aspectRatio > 1) {
      return {
        type: 'landscape',
        needsRotation: false,
        aspectRatio
      };
    } else {
      return {
        type: 'portrait',
        needsRotation: true, // Frame will need rotation for portrait photos
        aspectRatio: 1 / aspectRatio // Convert to landscape equivalent
      };
    }
  }

  /**
   * Find the closest matching aspect ratio from available frame ratios
   */
  static findClosestAspectRatio(photoAspectRatio: number): string {
    const availableRatios = [
      { name: '3x2', value: 1.5 },
      { name: '4x3', value: 1.333 },
      { name: '5x4', value: 1.25 },
      { name: '1x1', value: 1.0 },
      { name: '7x5', value: 1.4 },
      { name: '16x9', value: 1.778 },
      { name: '2x1', value: 2.0 },
      { name: '3x1', value: 3.0 }
    ];

    let closestRatio = availableRatios[0];
    let smallestDifference = Math.abs(photoAspectRatio - closestRatio.value);

    for (const ratio of availableRatios) {
      const difference = Math.abs(photoAspectRatio - ratio.value);
      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestRatio = ratio;
      }
    }

    return closestRatio.name;
  }

  /**
   * Construct frame asset path based on configuration
   */
  static constructFramePath(config: FrameAssetConfig): string {
    const { colorName, materialType, thickness, aspectRatio } = config;
    
    // Normalize names for file system
    const normalizedColor = colorName.toLowerCase().replace(/\s+/g, '_');
    const normalizedMaterial = materialType.toLowerCase().replace(/\s+/g, '_');
    const normalizedThickness = thickness.toLowerCase().replace(/\s+/g, '_');
    
    return `${this.baseAssetPath}${normalizedColor}_${normalizedMaterial}_${normalizedThickness}_${aspectRatio}.png`;
  }

  /**
   * Preload frame asset with caching
   */
  static async preloadFrameAsset(config: FrameAssetConfig): Promise<HTMLImageElement> {
    const assetPath = this.constructFramePath(config);
    
    // Check cache first
    if (this.assetCache.has(assetPath)) {
      return this.assetCache.get(assetPath)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.assetCache.set(assetPath, img);
        resolve(img);
      };
      
      img.onerror = () => {
        // Fallback to default frame
        console.warn(`Failed to load frame asset: ${assetPath}, using fallback`);
        const fallbackPath = `${this.baseAssetPath}black_wood_thin_4x3.png`;
        
        if (this.assetCache.has(fallbackPath)) {
          resolve(this.assetCache.get(fallbackPath)!);
          return;
        }
        
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          this.assetCache.set(fallbackPath, fallbackImg);
          resolve(fallbackImg);
        };
        fallbackImg.onerror = () => reject(new Error('Failed to load fallback frame asset'));
        fallbackImg.src = fallbackPath;
      };
      
      img.src = assetPath;
    });
  }

  /**
   * Get optimal frame configuration for a photo
   */
  static getOptimalFrameConfig(
    photoDimensions: PhotoDimensions,
    userSelections: {
      colorName: string;
      materialType: string;
      thickness: string;
    }
  ): FrameAssetConfig & { needsRotation: boolean } {
    const orientation = this.detectPhotoOrientation(photoDimensions);
    const aspectRatio = this.findClosestAspectRatio(orientation.aspectRatio);

    return {
      colorName: userSelections.colorName,
      materialType: userSelections.materialType,
      thickness: userSelections.thickness,
      aspectRatio,
      needsRotation: orientation.needsRotation && aspectRatio !== '1x1'
    };
  }

  /**
   * Clear cache (useful for memory management)
   */
  static clearCache(): void {
    this.assetCache.clear();
  }

  /**
   * Get cache size for debugging
   */
  static getCacheSize(): number {
    return this.assetCache.size;
  }
}