import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";

interface Category {
  id: string;
  name: string;
  image: string; // category photo or discount graphic
}

const categories: Category[] = [
  {
    id: "1",
    name: "Upto 50% Off",
    image: "https://via.placeholder.com/70x90.png?text=50%25",
  },
  {
    id: "2",
    name: "Men",
    image: "https://via.placeholder.com/70x90.png?text=Men",
  },
  {
    id: "3",
    name: "Women",
    image: "https://via.placeholder.com/70x90.png?text=Women",
  },
  {
    id: "4",
    name: "Footwear",
    image: "https://via.placeholder.com/70x90.png?text=Shoes",
  },
  {
    id: "5",
    name: "Accessories",
    image: "https://via.placeholder.com/70x90.png?text=Bag",
  },
];

const CategorySlider = () => {
  const handleCategoryPress = (category: Category) => {
    console.log("Category pressed:", category.name);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryContainer}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.8}
          >
            <View style={styles.flameWrapper}>
              <Image
                source={require("./flame-bg.png")} // flame PNG with transparent background
                style={styles.flameImage}
                resizeMode="contain"
              />
              <Image
                source={{ uri: category.image }}
                style={styles.categoryImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  categoryContainer: {
    alignItems: "center",
    marginRight: 20,
  },
  flameWrapper: {
    width: 80,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  flameImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B0082",
    marginTop: 6,
    textAlign: "center",
  },
});

export default CategorySlider;
