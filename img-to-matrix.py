import numpy as np
from PIL import Image
from sklearn.cluster import KMeans
from sklearn.utils import shuffle


def image_to_color_matrix(image_path, n_colors=9, transparency_threshold=128):
    """
    Converts an image into a 2D matrix of color indices (0-9).

    - 0 is reserved for transparency.
    - 1-9 are for the 'n_colors' dominant opaque colors.

    Args:
        image_path (str): Filepath to the image (PNG recommended for transparency).
        n_colors (int): The number of opaque colors to find (default is 9).
        transparency_threshold (int): Alpha value (0-255) below which a
                                      pixel is considered transparent.

    Returns:
        (tuple):
            - (np.ndarray): The 2D matrix of color indices.
            - (dict): A map where {index: "Transparent" or (R, G, B) tuple}.
    """

    try:
        # Load the image and ensure it has an Alpha channel (RGBA)
        img = Image.open(image_path).convert("RGBA")
        img_data = np.array(img)
    except Exception as e:
        print(f"Error: Could not open image at '{image_path}'.")
        print(f"Details: {e}")
        return None, None

    height, width, _ = img_data.shape

    # Reshape data to be a list of pixels (H*W, 4 channels)
    pixels = img_data.reshape(-1, 4)

    # 1. Separate transparent and opaque pixels
    alpha_channel = pixels[:, 3]
    is_transparent = alpha_channel < transparency_threshold

    # Get all RGB values for OPAQUE pixels
    opaque_pixels_rgb = pixels[
        ~is_transparent, :3
    ]  # ~is_transparent = "not transparent"

    # Initialize the color map
    color_map = {0: "Transparent"}

    # Initialize the final matrix with zeros (transparent)
    # It's a 1D array for now, we'll reshape it later
    final_labels_1d = np.zeros(height * width, dtype=int)

    # 2. Handle Opaque Pixels
    if opaque_pixels_rgb.shape[0] > 0:
        # Handle case where there are fewer unique colors than n_colors
        unique_colors = np.unique(opaque_pixels_rgb, axis=0)
        actual_n_colors = min(n_colors, unique_colors.shape[0])

        if actual_n_colors == 0:
            # Image is all transparent
            return final_labels_1d.reshape(height, width), color_map

        # 3. Cluster the opaque pixels using K-Means
        print(
            f"Clustering {opaque_pixels_rgb.shape[0]} opaque pixels into {actual_n_colors} colors..."
        )

        # Use a sample for large images to speed up fitting
        pixels_sample = shuffle(
            opaque_pixels_rgb,
            random_state=42,
            n_samples=min(20000, opaque_pixels_rgb.shape[0]),
        )

        kmeans = KMeans(n_clusters=actual_n_colors, random_state=42, n_init=10)
        kmeans.fit(pixels_sample)

        # Predict the cluster for *all* opaque pixels
        opaque_labels = kmeans.predict(opaque_pixels_rgb)

        # 4. Map cluster labels (0-8) to our matrix indices (1-9)
        # We add 1 because 0 is reserved for transparent

        # Place the new labels (1-9) into the correct spots in the 1D matrix
        final_labels_1d[~is_transparent] = opaque_labels + 1

        # 5. Populate the color map for user reference
        for i in range(actual_n_colors):
            # kmeans.cluster_centers_ are floats, convert to int for RGB
            color_rgb = tuple(kmeans.cluster_centers_[i].astype(int))
            color_map[i + 1] = color_rgb

    # Reshape the 1D array back into a 2D matrix
    final_matrix = final_labels_1d.reshape(height, width)

    return final_matrix, color_map
