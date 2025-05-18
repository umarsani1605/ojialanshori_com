<script setup>
import { ref, inject } from 'vue';

const dialogRef = inject('dialogRef');
const emit = defineEmits(['cancel', 'save']);

const category = dialogRef.value.data;
const formData = ref({ ...category });
const submitted = ref(false);

const onSave = () => {
    submitted.value = true;

    // Validasi semua field required
    if (!formData.value.name) {
        return;
    }
    emit('save', formData.value);
    dialogRef.value.close();
};

const onCancel = () => {
    emit('cancel');
    dialogRef.value.close();
};

console.log('formData', formData.value);
</script>

<template>
    <div class="p-fluid">
        <div class="field flex flex-col gap-2">
            <label for="name">Nama <span class="text-red-500">*</span></label>
            <InputText id="name" v-model="formData.name" required autofocus :class="{ 'p-invalid': submitted && !formData.name }" />
        </div>
        <div class="flex justify-end gap-2 mt-4">
            <Button label="Cancel" icon="pi pi-times" outlined @click="onCancel" />
            <Button label="Save" icon="pi pi-check" @click="onSave" />
        </div>
    </div>
</template>

<style scoped>
.field {
    margin-bottom: 1.5rem;
}
</style>
