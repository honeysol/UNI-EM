###
###
###
import sys, os, time, errno
import numpy as np
import copy
from itertools import chain
import subprocess as s
import time
import h5py
import threading

from PyQt5.QtWidgets import QMessageBox
from PyQt5.QtCore import Qt

from os import path, pardir
main_dir = path.abspath(path.dirname(sys.argv[0]))  # Dir of main
sys.path.append(main_dir)
icon_dir = path.join(main_dir, "icons")
sys.path.append(path.join(main_dir, "segment"))
sys.path.append(path.join(main_dir, "system"))

class FFNTraining():
    #
    def _Run(self, parent, params, comm_title):
    #
        with h5py.File(params['Training Image h5 File'], 'r') as f:
            image = f['raw'].value
            image_mean = np.mean(image).astype(np.int16)
            image_std  = np.std(image).astype(np.int16)
        print('Training image mean: ', image_mean)
        print('Training image std : ', image_std)
        #
        #except:
        #    print("Error: Training Image h5 was not loaded.")
        #    return False
        #
        if params['Sparse Z'] != Qt.Unchecked:
            arg = ' {"depth":9,"fov_size":[33,33,17],"deltas":[8,8,4]} '
        else:
            arg = ' {"depth":12,"fov_size":[33,33,33],"deltas":[8,8,8]} '

        ##
        comm_train = parent.u_info.exec_train + ' ' \
                    + ' --train_coords ' + params['Tensorflow Record File'] + ' ' \
                    + ' --data_volumes validation1@' + params['Training Image h5 File'] + '@raw ' \
                    + ' --label_volumes validation1@'+ params['Ground Truth h5 File']  + '@stack ' \
                    + ' --model_name convstack_3d.ConvStack3DFFNModel ' \
                    + ' --model_args '    + arg \
                    + ' --image_mean '   + np.str( image_mean ) \
                    + ' --image_stddev ' + np.str( image_std ) \
                    + ' --train_dir ' + params['Tensorflow Model Folder'] \
                    + ' --max_steps ' + np.str(np.int(params['Max Training Steps']))

        ##
        try:
        ##
            print(comm_title)
            #print(comm_train)
            s.run(comm_train.split())
            print(comm_title, ' was finished.')
        ##
        except :
            print(comm_title, " was not executed.")
            return False
        ##
        return True

    def __init__(self, u_info):
        ##
        datadir = u_info.data_path
        training_image_file = os.path.join(datadir, "ffn", "grayscale_maps.h5")
        ground_truth_file   = os.path.join(datadir, "ffn", "groundtruth.h5")
        record_file_path   = os.path.join(datadir, "ffn", "tf_record_file")
        tensorflow_file_path   = u_info.tensorflow_model_path
        self.paramfile = os.path.join( u_info.parameters_path, "FFN_Training.pickle")

        self.title = 'FFN Training'

        self.tips = [
                        'Maximal Training Steps',
                        'Paramter set for Anisotropic EM image',
                        'Input: Training Image h5 File',
                        'Input: Ground Truth h5 File',
                        'Input: Tensorflow Record File',
                        'Output: Tensorlflow Model Folder'
                        ]

        self.args = [
                        ['Max Training Steps', 'SpinBox', [1, 1000000, 1000000000]],
                        ['Sparse Z', 'CheckBox', False],
                        ['Training Image h5 File',  'LineEdit', training_image_file, 'BrowseFile'],
                        ['Ground Truth h5 File',    'LineEdit', ground_truth_file, 'BrowseFile'],
                        ['Tensorflow Record File',  'LineEdit', record_file_path, 'BrowseDir'],
                        ['Tensorflow Model Folder', 'LineEdit', tensorflow_file_path, 'BrowseDir'],
            ]
        ##

