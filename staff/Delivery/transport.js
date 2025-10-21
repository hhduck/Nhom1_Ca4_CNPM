document.addEventListener('DOMContentLoaded', function () {
    // === Tham chiếu đến các phần tử DOM ===
    const orderIdInput = document.getElementById('orderId');
    const customerNameInput = document.getElementById('customerName');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const deliveryAddressInput = document.getElementById('deliveryAddress');
    const deliveryDateInput = document.getElementById('deliveryDate');
    const noteInput = document.getElementById('note');

    const confirmDeliveryBtn = document.getElementById('confirmDeliveryBtn');
    const returnOrderBtn = document.getElementById('returnOrderBtn');
    const toggleReasonBtn = document.getElementById('toggleReasonBtn');
    const reasonTextArea = document.getElementById('reasonTextArea');
    const existingReturnReasonDiv = document.getElementById('existingReturnReason');
    const returnToWarehouseBtn = document.getElementById('returnToWarehouseBtn');

    // === Cấu hình (Thay đổi theo tên thư mục dự án của bạn trong htdocs) ===
    // VD: /my_project_folder/api
    const BASE_API_URL = '/NHOM1_CA4_CNPM/api'; // Đã đổi thành tên dự án của bạn

    // === Trạng thái ban đầu của giao diện ===
    if (reasonTextArea) reasonTextArea.style.display = 'none';
    if (existingReturnReasonDiv) existingReturnReasonDiv.style.display = 'none';

    // === Hàm để tải dữ liệu đơn hàng từ Backend và cập nhật giao diện ===
    async function loadOrderDetails(orderId) {
        if (!orderId) {
            // Không làm gì nếu không có orderId, hoặc hiển thị một thông báo
            // console.log('Không có mã đơn hàng để tải. Vui lòng cung cấp orderId qua URL.');
            // Bạn có thể xóa hết dữ liệu cũ nếu muốn
            if (orderIdInput) orderIdInput.value = '';
            if (customerNameInput) customerNameInput.value = '';
            if (phoneNumberInput) phoneNumberInput.value = '';
            if (deliveryAddressInput) deliveryAddressInput.value = '';
            if (deliveryDateInput) deliveryDateInput.value = '';
            if (noteInput) noteInput.value = '';
            // Reset trạng thái nút
            if (confirmDeliveryBtn) {
                confirmDeliveryBtn.disabled = true;
                confirmDeliveryBtn.textContent = 'XÁC NHẬN GIAO HÀNG';
                confirmDeliveryBtn.style.backgroundColor = '#6c757d';
            }
            if (returnOrderBtn) {
                returnOrderBtn.disabled = true;
                returnOrderBtn.textContent = 'TRẢ HÀNG';
                returnOrderBtn.style.backgroundColor = '#6c757d';
            }
            if (returnToWarehouseBtn) {
                returnToWarehouseBtn.disabled = true;
                returnToWarehouseBtn.textContent = 'HOÀN HÀNG VỀ KHO';
                returnToWarehouseBtn.style.backgroundColor = '#a0a0a0';
            }
            return;
        }

        try {
            const response = await fetch(`${BASE_API_URL}/get_order.php?orderId=${orderId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch order details');
            }
            const order = await response.json();

            if (order.status === 'error') {
                throw new Error(order.message);
            }

            // --- Điền dữ liệu vào form ---
            if (orderIdInput) orderIdInput.value = order.orderId;
            if (customerNameInput) customerNameInput.value = order.customerName;
            if (phoneNumberInput) phoneNumberInput.value = order.phoneNumber;
            if (deliveryAddressInput) deliveryAddressInput.value = order.deliveryAddress;
            if (deliveryDateInput) deliveryDateInput.value = order.deliveryDate;
            if (noteInput) noteInput.value = order.note;

            // --- Cập nhật giao diện dựa trên trạng thái đơn hàng ---
            if (order.status === 'Returned' && order.returnReason) {
                if (existingReturnReasonDiv) {
                    existingReturnReasonDiv.innerHTML = `<b>Lý do trả hàng:</b> ${order.returnReason}`;
                    existingReturnReasonDiv.style.display = 'block';
                }
                if (reasonTextArea) {
                    reasonTextArea.value = order.returnReason;
                    reasonTextArea.style.display = 'block';
                }
                if (toggleReasonBtn) toggleReasonBtn.textContent = 'Ẩn Lý do trả hàng';
            } else {
                if (reasonTextArea) {
                    reasonTextArea.value = '';
                    reasonTextArea.style.display = 'none';
                }
                if (existingReturnReasonDiv) existingReturnReasonDiv.style.display = 'none';
                if (toggleReasonBtn) toggleReasonBtn.textContent = 'LÝ DO TRẢ HÀNG';
            }

            // Trạng thái nút "XÁC NHẬN GIAO HÀNG"
            if (order.status === 'Confirmed' || order.status === 'Delivered' || order.status === 'Returned') {
                if (confirmDeliveryBtn) {
                    confirmDeliveryBtn.disabled = true;
                    confirmDeliveryBtn.textContent = 'ĐÃ XÁC NHẬN GIAO HÀNG';
                    confirmDeliveryBtn.style.backgroundColor = '#6c757d';
                }
            } else {
                if (confirmDeliveryBtn) {
                    confirmDeliveryBtn.disabled = false;
                    confirmDeliveryBtn.textContent = 'XÁC NHẬN GIAO HÀNG';
                    confirmDeliveryBtn.style.backgroundColor = '#87ceeb';
                }
            }

            // Trạng thái nút "TRẢ HÀNG" và "HOÀN HÀNG VỀ KHO"
            if (order.status === 'Returned') {
                if (returnOrderBtn) {
                    returnOrderBtn.disabled = true;
                    returnOrderBtn.textContent = 'ĐÃ TRẢ HÀNG';
                    returnOrderBtn.style.backgroundColor = '#6c757d';
                }
                if (order.returnToWarehouse) {
                    if (returnToWarehouseBtn) {
                        returnToWarehouseBtn.disabled = true;
                        returnToWarehouseBtn.textContent = 'ĐÃ HOÀN VỀ KHO';
                        returnToWarehouseBtn.style.backgroundColor = '#6c757d';
                    }
                } else {
                    if (returnToWarehouseBtn) {
                        returnToWarehouseBtn.disabled = false;
                        returnToWarehouseBtn.textContent = 'HOÀN HÀNG VỀ KHO';
                        returnToWarehouseBtn.style.backgroundColor = '#6c757d';
                    }
                }
            } else {
                if (returnOrderBtn) {
                    returnOrderBtn.disabled = false;
                    returnOrderBtn.textContent = 'TRẢ HÀNG';
                    returnOrderBtn.style.backgroundColor = '#dc3545';
                }
                if (returnToWarehouseBtn) {
                    returnToWarehouseBtn.disabled = true;
                    returnToWarehouseBtn.style.backgroundColor = '#a0a0a0';
                    returnToWarehouseBtn.textContent = 'HOÀN HÀNG VỀ KHO';
                }
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin đơn hàng:', error);
            alert('Không thể tải thông tin đơn hàng: ' + error.message);
            // Clear all fields on error
            if (orderIdInput) orderIdInput.value = orderId; // Giữ lại ID đã nhập
            if (customerNameInput) customerNameInput.value = '';
            if (phoneNumberInput) phoneNumberInput.value = '';
            if (deliveryAddressInput) deliveryAddressInput.value = '';
            if (deliveryDateInput) deliveryDateInput.value = '';
            if (noteInput) noteInput.value = '';
            // Reset nút về trạng thái disabled để tránh thao tác lỗi
            if (confirmDeliveryBtn) {
                confirmDeliveryBtn.disabled = true;
                confirmDeliveryBtn.textContent = 'XÁC NHẬN GIAO HÀNG';
                confirmDeliveryBtn.style.backgroundColor = '#6c757d';
            }
            if (returnOrderBtn) {
                returnOrderBtn.disabled = true;
                returnOrderBtn.textContent = 'TRẢ HÀNG';
                returnOrderBtn.style.backgroundColor = '#6c757d';
            }
            if (returnToWarehouseBtn) {
                returnToWarehouseBtn.disabled = true;
                returnToWarehouseBtn.textContent = 'HOÀN HÀNG VỀ KHO';
                returnToWarehouseBtn.style.backgroundColor = '#a0a0a0';
            }
        }
    }

    // === Xử lý khi trang được tải ===
    const urlParams = new URLSearchParams(window.location.search);
    const initialOrderId = urlParams.get('orderId'); // Bỏ giá trị mặc định 'DD003'

    if (orderIdInput && initialOrderId) {
        orderIdInput.value = initialOrderId; // Hiển thị mã đơn hàng từ URL
        loadOrderDetails(initialOrderId); // Tải chi tiết đơn hàng nếu có ID
    } else {
        // console.log('Không có mã đơn hàng trên URL. Vui lòng truyền orderId, ví dụ: ?orderId=DD003');
        // Vẫn gọi loadOrderDetails với null/undefined để nó reset giao diện
        loadOrderDetails(null);
        alert('Vui lòng cung cấp mã đơn hàng qua URL để xem chi tiết. Ví dụ: ?orderId=DD003');
    }

    // === Xử lý sự kiện click cho các nút ===

    // Nút "XÁC NHẬN GIAO HÀNG"
    if (confirmDeliveryBtn) {
        confirmDeliveryBtn.addEventListener('click', async function () {
            if (confirmDeliveryBtn.disabled) return;
            const orderId = orderIdInput.value;
            if (confirm(`Xác nhận đã giao hàng cho đơn hàng ${orderId}?`)) {
                try {
                    const response = await fetch(`${BASE_API_URL}/confirm_delivery.php`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: orderId })
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to confirm delivery');
                    }
                    const result = await response.json();
                    if (result.status === 'error') {
                        throw new Error(result.message);
                    }
                    alert(`Đơn hàng ${orderId} đã được xác nhận giao hàng.`);
                    loadOrderDetails(orderId);
                } catch (error) {
                    alert('Lỗi khi xác nhận giao hàng: ' + error.message);
                }
            }
        });
    }

    // Nút "TRẢ HÀNG"
    if (returnOrderBtn) {
        returnOrderBtn.addEventListener('click', function () {
            if (returnOrderBtn.disabled) return;
            const orderId = orderIdInput.value;
            if (confirm(`Bạn có chắc muốn đánh dấu đơn hàng ${orderId} là trả hàng?`)) {

                if (reasonTextArea) {
                    reasonTextArea.style.display = 'block';
                    reasonTextArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                if (toggleReasonBtn) toggleReasonBtn.textContent = 'Ẩn Lý do trả hàng';

                if (returnToWarehouseBtn) {
                    returnToWarehouseBtn.disabled = false;
                    returnToWarehouseBtn.style.backgroundColor = '#6c757d';
                }
                alert(`Đơn hàng ${orderId} đã được đánh dấu là trả hàng. Vui lòng nhập lý do và nhấn 'Hoàn hàng về kho'.`);
            }
        });
    }

    // Nút "LÝ DO TRẢ HÀNG" (Toggle hiển thị textarea)
    if (toggleReasonBtn) {
        toggleReasonBtn.addEventListener('click', function () {
            if (reasonTextArea) {
                if (reasonTextArea.style.display === 'none') {
                    reasonTextArea.style.display = 'block';
                    if (toggleReasonBtn) toggleReasonBtn.textContent = 'Ẩn Lý do trả hàng';
                    reasonTextArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    reasonTextArea.style.display = 'none';
                    if (toggleReasonBtn) toggleReasonBtn.textContent = 'LÝ DO TRẢ HÀNG';
                }
            }
        });
    }

    // Nút "HOÀN HÀNG VỀ KHO"
    if (returnToWarehouseBtn) {
        returnToWarehouseBtn.addEventListener('click', async function () {
            if (returnToWarehouseBtn.disabled) return;
            const orderId = orderIdInput.value;
            const reason = reasonTextArea ? reasonTextArea.value.trim() : '';

            if (reason === '') {
                alert('Vui lòng nhập lý do trả hàng trước khi hoàn hàng về kho.');
                if (reasonTextArea) reasonTextArea.focus();
                return;
            }

            if (confirm(`Xác nhận hoàn hàng đơn hàng ${orderId} về kho với lý do:\n${reason}?`)) {
                try {
                    const response = await fetch(`${BASE_API_URL}/return_order.php`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: orderId, returnReason: reason })
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to return order to warehouse');
                    }
                    const result = await response.json();
                    if (result.status === 'error') {
                        throw new Error(result.message);
                    }
                    alert(`Đơn hàng ${orderId} đã được hoàn về kho với lý do: ${reason}`);
                    loadOrderDetails(orderId);
                } catch (error) {
                    alert('Lỗi khi hoàn hàng về kho: ' + error.message);
                }
            }
        });
    }
});