import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { RechargeWalletCardProps } from "@/types/profile";

const RechargeWalletCard: React.FC<RechargeWalletCardProps> = ({
  cashbackText = "Upto 10% cashback on wallet recharge",
  amountOptions = [120, 5000, 10000],
  onAmountSelect,
  onSubmit,
  isLoading = false,
  currency = "₹",
}) => {
  const [selectedAmount, setSelectedAmount] = useState<"other" | number>("other");
  const [customAmount, setCustomAmount] = useState("");

  const handleAmountPress = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
    onAmountSelect?.(amount);
  };

  const handleCustomPress = () => {
    setSelectedAmount("other");
    setCustomAmount("");
    onAmountSelect?.("other");
  };

  const handleRecharge = () => {
    if (isLoading) return;
    
    const amount = selectedAmount === "other" ? Number(customAmount) : selectedAmount;
    if (!isNaN(amount) && amount > 0) {
      onSubmit?.(amount);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cashback}>{cashbackText}</Text>
        <Text style={styles.arrow}>›</Text>
      </View>

      <View style={styles.amountContainer}>
        {amountOptions.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[
              styles.amountButton,
              selectedAmount === amount && styles.selectedButton,
            ]}
            onPress={() => handleAmountPress(amount)}
          >
            <Text
              style={[
                styles.amountText,
                selectedAmount === amount && styles.selectedText,
              ]}
            >
              {currency}{amount}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.amountButton,
            selectedAmount === "other" && styles.selectedButton,
          ]}
          onPress={handleCustomPress}
        >
          <Text
            style={[
              styles.amountText,
              selectedAmount === "other" && styles.selectedText,
            ]}
          >
            Other
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter your amount"
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={customAmount}
        onChangeText={setCustomAmount}
      />

      <Text style={styles.paymentText}>
        Recharge using UPI, Debit/Credit, Wallet, Netbanking
      </Text>

      <TouchableOpacity 
        style={[styles.rechargeButton, isLoading && styles.disabledButton]} 
        onPress={handleRecharge}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.rechargeButtonText}>Play and add</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F8F6FF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    backgroundColor: "#E7DEFF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cashback: {
    fontSize: 14,
    color: "#4B2EFF",
    fontWeight: "500",
  },
  arrow: {
    fontSize: 18,
    color: "#4B2EFF",
  },
  amountContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  amountButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#EFEAFD",
    marginRight: 8,
    marginBottom: 8,
  },
  selectedButton: {
    backgroundColor: "#4B2EFF",
  },
  amountText: {
    color: "#4B2EFF",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedText: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#000",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 10,
  },
  paymentText: {
    fontSize: 12,
    color: "#777",
    marginBottom: 14,
  },
  rechargeButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: "center",
  },
  rechargeButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default RechargeWalletCard;
