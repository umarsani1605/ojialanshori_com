<script setup>
import { ref, inject, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import ConfirmDialog from 'primevue/confirmdialog';
import { useSantriStore } from '@/stores/santriStore';

const dialogRef = inject('dialogRef');
const emit = defineEmits(['cancel', 'save', 'delete']);
const confirm = useConfirm();

const pentashih = dialogRef.value.data;
const formData = ref({
    santri_ids: pentashih.santri_list?.map((santri) => santri.id) || []
});
const submitted = ref(false);
const pentashihList = ref([]);
const selectedPentashih = ref(null);
const availableSantriList = ref([]);

const router = useRouter();
const santriStore = useSantriStore();

const fetchSantriList = async () => {
    try {
        const response = await santriStore.getAll({ role: 'pentashih' });
        pentashihList.value = response.data;

        if (pentashih.id_pentashih) {
            selectedPentashih.value = pentashihList.value.find((p) => p.id === pentashih.id_pentashih);
        }
    } catch (error) {
        console.error('Error fetching pentashih list:', error);
    }
};

watch(selectedPentashih, async (newPentashih) => {
    if (newPentashih) {
        const existingSantriIds = formData.value.santri_ids;

        const response = await santriStore.getAll({ assigned: 'false', gender: newPentashih.gender });

        availableSantriList.value = [...response.data, ...(pentashih.santri_list || [])].filter((santri) => santri.id !== selectedPentashih.value?.id);

        formData.value.santri_ids = existingSantriIds;
    } else {
        availableSantriList.value = [];
    }
});

const showDeleteConfirmation = () => {
    confirm.require({
        message: 'Daftar santri kosong. Apakah Anda ingin menghapus pentashih ini?',
        header: 'Konfirmasi Penghapusan',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Ya, Hapus',
        rejectLabel: 'Tidak',
        accept: () => {
            emit('delete', selectedPentashih.value.id);
            dialogRef.value.close();
        },
        reject: () => {
            // Biarkan user melanjutkan edit tanpa santri
        }
    });
};

const onSave = () => {
    submitted.value = true;

    if (!selectedPentashih.value) {
        return;
    }

    // Cek jika santri_ids kosong
    if (formData.value.santri_ids.length === 0) {
        showDeleteConfirmation();
        return;
    }

    // Jika ada santri, lanjutkan save seperti biasa
    emit('save', {
        id_pentashih: selectedPentashih.value.id,
        santri_ids: formData.value.santri_ids
    });
    dialogRef.value.close();
};

const onCancel = () => {
    emit('cancel');
    dialogRef.value.close();
};

const goToPentashihList = () => {
    dialogRef.value.close();
    router.push('/admin/daftar-pentashih');
};

onMounted(() => {
    fetchSantriList();
    console.log(pentashih);
});
</script>

<template>
    <div class="p-fluid">
        <ConfirmDialog />

        <div class="field flex flex-col gap-2">
            <div class="flex justify-between items-center">
                <label for="pentashih">Pentashih <span class="text-red-500">*</span></label>
                <Button icon="pi pi-plus" label="Pentashih Baru" @click="goToPentashihList" class="p-0" variant="text" size="small" />
            </div>
            <Dropdown id="pentashih" v-model="selectedPentashih" :options="pentashihList" optionLabel="name" placeholder="Pilih Pentashih" :class="{ 'p-invalid': submitted && !selectedPentashih }" :disabled="!!pentashih.id_pentashih" />
        </div>

        <div class="field flex flex-col gap-2">
            <label for="santri">Daftar Santri</label>
            <MultiSelect id="santri" v-model="formData.santri_ids" :options="availableSantriList" optionLabel="name" optionValue="id" placeholder="Pilih Santri" display="chip" :disabled="!selectedPentashih" filter />
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
