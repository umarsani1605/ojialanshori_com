<script setup>
import { inject } from 'vue';

const emit = defineEmits(['confirm', 'cancel']);

const props = defineProps({
    title: {
        type: String,
        default: 'Konfirmasi Hapus'
    },
    message: {
        type: String,
        default: 'Apakah Anda yakin ingin menghapus data ini?'
    }
});

const dialogRef = inject('dialogRef');

const data = dialogRef.value.data;

const onConfirm = () => {
    emit('confirm', data);
    dialogRef.value.close();
};

const onCancel = () => {
    emit('cancel');
    dialogRef.value.close();
};
</script>

<template>
    <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>{{ message }}</span>
        <div class="flex justify-end gap-2 mt-4">
            <Button label="No" icon="pi pi-times" severity="secondary" @click="onCancel" />
            <Button label="Yes" icon="pi pi-check" severity="danger" @click="onConfirm" />
        </div>
    </div>
</template>
