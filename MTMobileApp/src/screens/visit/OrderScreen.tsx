import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, TextInput, Alert, FlatList,
} from 'react-native';

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  unit: string;
  inStock: number;
}

interface OrderItem {
  product: Product;
  quantity: number;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Amoxicillin 500mg', code: 'MED-001', price: 3.50, unit: 'ədəd', inStock: 2450 },
  { id: '2', name: 'Ibuprofen 400mg', code: 'MED-002', price: 2.80, unit: 'ədəd', inStock: 1820 },
  { id: '3', name: 'Paracetamol 500mg', code: 'MED-003', price: 1.50, unit: 'ədəd', inStock: 3200 },
  { id: '4', name: 'Omeprazol 20mg', code: 'MED-004', price: 4.20, unit: 'ədəd', inStock: 950 },
  { id: '5', name: 'Cetirizin 10mg', code: 'MED-005', price: 2.10, unit: 'ədəd', inStock: 780 },
  { id: '6', name: 'Metformin 850mg', code: 'MED-006', price: 5.60, unit: 'ədəd', inStock: 1350 },
  { id: '7', name: 'Atorvastatin 20mg', code: 'MED-007', price: 8.90, unit: 'ədəd', inStock: 620 },
  { id: '8', name: 'Vitamin C 1000mg', code: 'VIT-001', price: 1.20, unit: 'ədəd', inStock: 5600 },
  { id: '9', name: 'Vitamin D3 1000IU', code: 'VIT-002', price: 3.80, unit: 'ədəd', inStock: 2800 },
  { id: '10', name: 'Bandaj 10cm', code: 'ACC-001', price: 0.80, unit: 'ədəd', inStock: 1500 },
];

export default function OrderScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [note, setNote] = useState('');

  const filtered = mockProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = (product: Product) => {
    const exists = orderItems.find(i => i.product.id === product.id);
    if (exists) {
      setOrderItems(orderItems.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setOrderItems([...orderItems, { product, quantity: 1 }]);
    }
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setOrderItems(orderItems.filter(i => i.product.id !== productId));
    } else {
      setOrderItems(orderItems.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
    }
  };

  const totalAmount = orderItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const totalItems = orderItems.reduce((s, i) => s + i.quantity, 0);

  const submitOrder = () => {
    if (orderItems.length === 0) {
      Alert.alert('Xəta', 'Ən azı 1 məhsul əlavə edin');
      return;
    }
    Alert.alert(
      'Sifariş Təsdiqi',
      `${orderItems.length} məhsul, ${totalItems} ədəd\nCəmi: ₼${totalAmount.toFixed(2)}`,
      [
        { text: 'Ləğv et', style: 'cancel' },
        { text: 'Təsdiq et', onPress: () => {
          Alert.alert('Uğurlu', 'Sifariş göndərildi!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Məhsul axtar..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <ScrollView style={styles.content}>
        {/* Product List */}
        <Text style={styles.sectionTitle}>Məhsullar ({filtered.length})</Text>
        {filtered.map(product => {
          const inOrder = orderItems.find(i => i.product.id === product.id);
          return (
            <TouchableOpacity key={product.id} style={styles.productCard} onPress={() => addItem(product)}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productMeta}>{product.code} · {product.inStock} {product.unit} stokda</Text>
              </View>
              <View style={styles.productRight}>
                <Text style={styles.productPrice}>₼{product.price.toFixed(2)}</Text>
                {inOrder && (
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyText}>{inOrder.quantity}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Order Summary */}
        {orderItems.length > 0 && (
          <View style={styles.orderSection}>
            <Text style={styles.sectionTitle}>Sifariş ({orderItems.length} məhsul)</Text>
            {orderItems.map(item => (
              <View key={item.product.id} style={styles.orderItem}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName}>{item.product.name}</Text>
                  <Text style={styles.orderItemPrice}>₼{(item.product.price * item.quantity).toFixed(2)}</Text>
                </View>
                <View style={styles.qtyControls}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.product.id, item.quantity - 1)}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.product.id, item.quantity + 1)}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Note */}
            <TextInput
              style={styles.noteInput}
              placeholder="Qeyd əlavə et..."
              value={note}
              onChangeText={setNote}
              multiline
              placeholderTextColor="#9ca3af"
            />
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      {orderItems.length > 0 && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.totalLabel}>Cəmi</Text>
            <Text style={styles.totalAmount}>₼{totalAmount.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={submitOrder}>
            <Text style={styles.submitBtnText}>Sifariş göndər ({totalItems})</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, borderRadius: 12, paddingHorizontal: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#1a1a2e' },
  content: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 12, marginTop: 8 },
  productCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  productMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  productRight: { alignItems: 'flex-end', gap: 4 },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#6C63FF' },
  qtyBadge: { backgroundColor: '#6C63FF', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  qtyText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  orderSection: { marginTop: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  orderItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  orderItemInfo: { flex: 1 },
  orderItemName: { fontSize: 14, fontWeight: '500', color: '#1a1a2e' },
  orderItemPrice: { fontSize: 12, color: '#6C63FF', fontWeight: '600', marginTop: 2 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 18, fontWeight: '600', color: '#374151' },
  qtyValue: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', minWidth: 24, textAlign: 'center' },
  noteInput: { marginTop: 12, backgroundColor: '#f9fafb', borderRadius: 10, padding: 12, fontSize: 14, color: '#374151', minHeight: 60, textAlignVertical: 'top' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  totalLabel: { fontSize: 12, color: '#6b7280' },
  totalAmount: { fontSize: 22, fontWeight: '800', color: '#1a1a2e' },
  submitBtn: { backgroundColor: '#6C63FF', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
